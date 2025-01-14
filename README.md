## Adding R2/D1 Storage Implementation

### Phase 1: D1 Database Setup

#### Step 1: Database Creation and Schema Setup

1. Check existing D1 databases:
```bash
npx wrangler d1 list
```

2. Get database ID for configuration (if database exists)
   - Database ID: `8308585e-a508-479f-91db-eb6633b37c84`
   - Add to `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "image-generator-db"
   database_id = "8308585e-a508-479f-91db-eb6633b37c84"
   ```

3. Create database schema structure:
```bash
mkdir -p functions/database
touch functions/database/schema.sql
```

4. Add schema definition to `functions/database/schema.sql`:
```sql
CREATE TABLE image_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    style TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

5. Apply schema to local database:
```bash
npx wrangler d1 execute image-generator-db --local --file=./functions/database/schema.sql
```

6. Verify schema creation:
```bash
npx wrangler d1 execute image-generator-db --local --command="SELECT * FROM image_metadata;"
```

Each step can be validated by checking command output for success messages and error-free execution.

#### Step 2: Database Utility Layer and Validation

1. Create database utility structure:
```bash
mkdir -p functions/utils
touch functions/utils/database.ts
```

2. Create temporary test endpoint for validation:
```bash
touch functions/api/test-db.ts
```

3. Validate database setup by accessing test endpoint:
```
http://localhost:8788/api/test-db
```

Example successful response:
```json
{
  "success": true,
  "meta": {
    "served_by": "miniflare.db",
    "duration": 1,
    "changes": 0,
    "last_row_id": 0,
    "changed_db": false,
    "size_after": 16384,
    "rows_read": 0,
    "rows_written": 0
  },
  "results": [{"count": 0}]
}
```

Response indicates:
- Database connection successful
- Schema exists and is queryable
- Table is empty (count: 0)
- Database operations working as expected

After validation, test-db.ts can be removed as it's not needed for production functionality.

### Phase 2: R2 Storage Setup

#### Step 1: Bucket Creation and Configuration

1. Create R2 bucket:
```bash
npx wrangler r2 bucket create image-generator-storage
```

2. Add R2 configuration to `wrangler.toml`:
```toml
[[r2_buckets]]
bucket_name = "image-generator-storage"
binding = "image_generator_storage"
```

3. Enable public access through Cloudflare Dashboard:
   - Navigate to R2 in dashboard
   - Select bucket (image-generator-storage)
   - Settings > Public Access
   - Enable r2.dev access
   - Public URL provided: `https://pub-bccf54bed7f448cf93fa464f63e6eb11.r2.dev`

4. Test basic R2 operations:
```bash
# Create test file
echo "Hello R2" > test.txt

# Upload to R2
npx wrangler r2 object put "image-generator-storage/test.txt" --file=test.txt

# Verify by getting object
npx wrangler r2 object get "image-generator-storage/test.txt"

# Verify public access
# Visit: https://pub-bccf54bed7f448cf93fa464f63e6eb11.r2.dev/test.txt

# Clean up test file
npx wrangler r2 object delete "image-generator-storage/test.txt"
```

Each step can be validated by checking command outputs and verifying public URL access.

#### Step 2: Storage Utility Layer Implementation

1. Create storage utility module (`functions/utils/storage.ts`):
```typescript
interface R2Response {
    url: string;
    key: string;
}

const PUBLIC_BUCKET_URL = 'https://pub-bccf54bed7f448cf93fa464f63e6eb11.r2.dev';

export async function uploadToR2(
    env: any,
    imageData: ArrayBuffer,
    filename: string
): Promise<R2Response> {
    // ... implementation details
}

export async function getImageFromR2(
    env: any,
    key: string
): Promise<R2Response | null> {
    // ... implementation details
}
```

2. Create temporary test endpoint (`functions/api/test-storage.ts`):
```typescript
import { uploadToR2, getImageFromR2 } from '../utils/storage';

export const onRequestGet = async (context: { env: any }) => {
    // ... implementation details
}
```

3. Test R2 operations:
- Start preview server: `npm run preview`
- Access test endpoint: `http://localhost:8788/api/test-storage`
- Successful response example:
```json
{
    "success": true,
    "upload": {
        "url": "https://pub-bccf54bed7f448cf93fa464f63e6eb11.r2.dev/test-1736889328355.txt",
        "key": "test-1736889328355.txt"
    },
    "retrieve": {
        "url": "https://pub-bccf54bed7f448cf93fa464f63e6eb11.r2.dev/test-1736889328355.txt",
        "key": "test-1736889328355.txt"
    }
}
```

Test validates:
- File upload functionality
- File retrieval functionality
- Public URL generation
- R2 bucket accessibility
- Proper error handling

After successful testing, temporary test endpoint can be removed as it's not needed for production.