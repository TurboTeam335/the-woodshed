import { useState } from 'react'
import { Key, Trash2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Button } from '../components/ui/Button'

export default function SettingsView(): JSX.Element {
  const { settings, saveApiKey, removeApiKey, testApiKey } = useStore()

  const [newKey, setNewKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleSave = async () => {
    setSaveError(null)
    setSaveSuccess(false)
    setIsSaving(true)
    const result = await saveApiKey(newKey.trim())
    setIsSaving(false)
    if (result.success) {
      setSaveSuccess(true)
      setNewKey('')
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError(result.error ?? 'Failed to save key')
    }
  }

  const handleTest = async () => {
    setTestResult(null)
    setIsTesting(true)
    const keyToTest = newKey.trim() || ''
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Enter an API key to test' })
      setIsTesting(false)
      return
    }
    const result = await testApiKey(keyToTest)
    setIsTesting(false)
    setTestResult({
      success: result.success,
      message: result.success ? 'API key is valid ✓' : (result.error ?? 'Invalid key')
    })
  }

  const handleRemove = async () => {
    await removeApiKey()
    setShowRemoveConfirm(false)
  }

  const isValidFormat = newKey.startsWith('sk-ant-')

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your Anthropic API key to enable AI session generation.</p>
        </div>

        {/* Current key status */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={15} className="text-brand-400" />
            <h2 className="font-semibold text-gray-200">Anthropic API Key</h2>
          </div>

          {settings?.hasApiKey ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-green-400 font-medium">API key configured</span>
              </div>
              <p className="text-xs text-gray-600 mt-1 font-mono">{settings.maskedApiKey}</p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={14} className="text-orange-400" />
                <span className="text-orange-400 font-medium">No API key configured</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Required to generate practice sessions.</p>
            </div>
          )}

          {/* Key input */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                {settings?.hasApiKey ? 'Replace API Key' : 'Enter API Key'}
              </label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => { setNewKey(e.target.value); setTestResult(null); setSaveError(null) }}
                placeholder="sk-ant-api03-..."
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 font-mono focus:outline-none focus:border-brand-500/50 transition-colors"
                data-selectable
              />
              {newKey && !isValidFormat && (
                <p className="text-xs text-orange-400 mt-1">
                  Expected format: sk-ant-...
                </p>
              )}
            </div>

            {/* Test result */}
            {testResult && (
              <div className={`flex items-center gap-2 text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.success
                  ? <CheckCircle2 size={12} />
                  : <AlertCircle size={12} />
                }
                {testResult.message}
              </div>
            )}

            {/* Error */}
            {saveError && (
              <p className="text-xs text-red-400">{saveError}</p>
            )}

            {/* Success */}
            {saveSuccess && (
              <p className="text-xs text-green-400">API key saved successfully.</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={isTesting}
                onClick={handleTest}
                disabled={!newKey.trim()}
              >
                Test Key
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSaving}
                onClick={handleSave}
                disabled={!newKey.trim() || !isValidFormat}
              >
                Save Key
              </Button>
            </div>
          </div>

          {/* Remove key */}
          {settings?.hasApiKey && (
            <div className="mt-4 pt-4 border-t border-surface-700">
              {!showRemoveConfirm ? (
                <button
                  onClick={() => setShowRemoveConfirm(true)}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                  Remove API key
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Remove stored key?</span>
                  <Button variant="danger" size="sm" onClick={handleRemove}>Remove</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How to get a key */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-3">How to get an API key</h3>
          <ol className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-mono text-xs mt-0.5">1.</span>
              Go to <strong className="text-gray-300">console.anthropic.com</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-mono text-xs mt-0.5">2.</span>
              Create an account or sign in
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-mono text-xs mt-0.5">3.</span>
              Navigate to <strong className="text-gray-300">API Keys</strong> in the dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-500 font-mono text-xs mt-0.5">4.</span>
              Create a new key and paste it above
            </li>
          </ol>
          <p className="text-xs text-gray-600 mt-3">
            Your key is stored securely using macOS Keychain encryption (safeStorage). It never leaves your machine.
          </p>
        </div>

        {/* Model info */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">Session Generation</h3>
          <div className="space-y-1 text-sm text-gray-500">
            <p>Model: <span className="text-gray-400 font-mono">claude-3-5-sonnet-20241022</span></p>
            <p>~1 API call per session · ~3,000–5,000 tokens per call</p>
            <p className="text-xs text-gray-600 mt-2">
              Approximate cost: &lt;$0.05 per session at current Sonnet pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
