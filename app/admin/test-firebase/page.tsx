'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function TestFirebasePage() {
  const [testResults, setTestResults] = useState<{
    storageInit: boolean;
    storageInitError?: string;
    uploadTest?: boolean;
    uploadError?: string;
    configTest: boolean;
  }>({
    storageInit: false,
    configTest: false
  });

  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = { configTest: true };

    // Test 1: Storage initialization
    try {
      console.log('Testing Firebase Storage initialization...');
      if (storage) {
        results.storageInit = true;
        console.log('✅ Storage initialized successfully');
      } else {
        results.storageInit = false;
        results.storageInitError = 'Storage object is null';
      }
    } catch (error) {
      results.storageInit = false;
      results.storageInitError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Storage initialization failed:', error);
    }

    // Test 2: Upload test with tiny file
    if (results.storageInit) {
      try {
        console.log('Testing file upload...');
        
        // Create a tiny test file
        const testContent = 'test';
        const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
        
        const storageRef = ref(storage, `test/${Date.now()}-test.txt`);
        console.log('Uploading test file...');
        
        const snapshot = await uploadBytes(storageRef, testFile);
        console.log('Getting download URL...');
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('✅ Upload test successful:', downloadURL);
        
        results.uploadTest = true;
      } catch (error) {
        results.uploadTest = false;
        results.uploadError = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Upload test failed:', error);
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Firebase Storage Diagnostics
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div>
            <Button 
              onClick={runDiagnostics}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Diagnostics...' : 'Run Firebase Storage Tests'}
            </Button>
          </div>

          {Object.keys(testResults).length > 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Test Results
              </h2>

              {/* Configuration Test */}
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      Firebase Configuration
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Project ID: writereadhub<br/>
                      Storage Bucket: writereadhub.firebasestorage.app<br/>
                      Status: ✅ Configuration loaded
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Storage Initialization Test */}
              <Alert className={testResults.storageInit ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20"}>
                {testResults.storageInit ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div>
                    <p className={`font-semibold ${testResults.storageInit ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      Storage Initialization: {testResults.storageInit ? '✅ Success' : '❌ Failed'}
                    </p>
                    {testResults.storageInitError && (
                      <p className="text-red-700 dark:text-red-300 mt-1">
                        Error: {testResults.storageInitError}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Upload Test */}
              {testResults.uploadTest !== undefined && (
                <Alert className={testResults.uploadTest ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20"}>
                  {testResults.uploadTest ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div>
                      <p className={`font-semibold ${testResults.uploadTest ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        Upload Test: {testResults.uploadTest ? '✅ Success' : '❌ Failed'}
                      </p>
                      {testResults.uploadError && (
                        <p className="text-red-700 dark:text-red-300 mt-1">
                          Error: {testResults.uploadError}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🔧 Common Solutions
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <p><strong>If tests fail, try these steps:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to <a href="https://console.firebase.google.com/project/writereadhub/storage" target="_blank" className="underline">Firebase Storage Console</a></li>
                <li>Click <strong>"Get started"</strong> if you see a setup screen</li>
                <li>Choose <strong>"Start in test mode"</strong> for now</li>
                <li>If already set up, go to <strong>"Rules"</strong> tab and use:</li>
              </ol>
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800 rounded font-mono text-xs">
                {`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`}
              </div>
              <p className="text-xs mt-2">⚠️ This allows public access. Perfect for testing, secure later for production.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}