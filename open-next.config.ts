import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Optional: persist Next.js's incremental cache (ISR/data cache) in an R2 bucket
// instead of the Worker's ephemeral memory. To enable, bind an R2 bucket named
// NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc, then uncomment below:
//
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
// export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });

export default defineCloudflareConfig();
