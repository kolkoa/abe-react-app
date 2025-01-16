# Cloudflare Pages Configuration Documentation

## Setting Up Staging Environment

1. Create staging branch:
```bash
git checkout -b staging
git push -u origin staging
```

2. Configure Cloudflare Pages branch deployments:
   - Navigate to Pages project settings
   - Go to Branches and deployments
   - Set Production branch to "main"
   - Under Preview branches, select "Custom branches"
   - Add "staging" to included branches

3. Configure environment variables:
   - In Pages project settings, add necessary environment variables
   - Add variables to both Production and Preview environments
   - Example: RECRAFT_API_KEY for image generation

4. Configure Access to Staging:
   - Go to Access > Applications
   - Click on your Pages application
   - Under Policies, add a policy for preview deployments:
     - Include your development team's email domains
     - Ensure policy covers *.pages.dev domains
   - Save and verify access to staging environment

## Implementing R2 Storage

1. Create R2 bucket:
   - Navigate to R2 in Cloudflare dashboard
   - Create bucket "image-generator-storage"
   - Note bucket name for configuration

2. Create R2 access tokens:
   - In R2 settings, create two API tokens:
     - Read/Write token for uploads
     - Read-only token for downloads
   - Specify access to "image-generator-storage" bucket

3. Configure R2 bindings in Pages:
   - Go to Pages project settings
   - Navigate to Functions > R2 Bindings
   - Add binding:
     - Variable name: BUCKET
     - R2 bucket: image-generator-storage
   - Configure for both Production and Preview environments

4. Implement R2 upload functionality:
   - Create `functions/api/r2-upload.ts` for upload handling
   - Modify frontend to handle R2 upload after image generation
   - Test in staging environment before deploying to production

5. Deploy and verify:
   - Push changes to staging branch
   - Verify upload functionality in preview deployment
   - Check R2 bucket for successful file storage