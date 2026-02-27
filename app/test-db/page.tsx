// app/test-db/page.tsx
"use client";

import { createClient } from '@/lib/supabase/client'

export default function TestDB() {
    const testConnection = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('church_events')
            .select('*')

        if (error) {
            console.error('Error:', error)
        } else {
            console.log('Success! Events:', data)
        }
    }

    return (
        <div className="p-8">
            <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Test Database Connection
            </button>
        </div>
    )
}
/* ```

Visit `http://localhost:3000/test-db` and click the button. Check browser console (F12) for results!

## **Visual Guide:**
```
Supabase Dashboard Flow:
1. supabase.com → Sign Up
2. New Project → Name it "faithbeat"
3. Settings → API → Copy URL & Key
4. SQL Editor → New Query → Paste SQL → Run
5. Authentication → Providers → Enable Email
✅ Done! */