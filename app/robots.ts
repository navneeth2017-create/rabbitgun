import type { MetadataRoute } from "next";

/** Private, login-only. Nothing here is for crawlers. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
