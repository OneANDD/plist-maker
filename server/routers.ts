import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { buildHostedManifest, createInstallationLink, httpsOriginFromRequest, normalizedManifestName } from "./manifest";
import { storagePut } from "./storage";

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const publishedManifestInput = z.object({
  ipaUrl: z.string().trim().max(2048).refine((value) => isHttpsUrl(value) && /\.ipa(?:[?#]|$)/i.test(value), "Use a public HTTPS IPA URL."),
  iconUrl: z.string().trim().max(2048).refine((value) => isHttpsUrl(value) && /\.(?:png|jpe?g)(?:[?#]|$)/i.test(value), "Use a public HTTPS PNG or JPG URL."),
  bundleIdentifier: z.string().trim().max(255).regex(/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/, "Use a valid bundle identifier."),
  bundleVersion: z.string().trim().min(1).max(255),
  appName: z.string().trim().min(1).max(255),
  manifestName: z.string().trim().min(1).max(100),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  manifest: router({
    publish: publicProcedure.input(publishedManifestInput).mutation(async ({ ctx, input }) => {
      const filename = `${normalizedManifestName(input.manifestName)}.plist`;
      const manifestXml = buildHostedManifest(input);
      const stored = await storagePut(`manifests/${filename}`, manifestXml, "application/xml");
      const manifestUrl = `${httpsOriginFromRequest(ctx.req)}${stored.url}`;

      return {
        manifestFilename: filename,
        manifestUrl,
        installUrl: createInstallationLink(manifestUrl),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
