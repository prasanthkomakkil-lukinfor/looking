import { useState } from 'react';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WhatsAppLoginProps {
  onLoginSuccess: () => void;
}

export function WhatsAppLogin({ onLoginSuccess }: WhatsAppLoginProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP, verifyOTP } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await sendOTP(phoneNumber);
    if (result.success && result.whatsappUrl) {
      setStep('code');
      window.open(result.whatsappUrl, '_blank');
    } else {
      setError(result.error || 'Failed to send code');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    const result = await verifyOTP(phoneNumber, code);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setCode('');
    setError('');
    setLoading(true);
    const result = await sendOTP(phoneNumber);
    if (result.success && result.whatsappUrl) {
      window.open(result.whatsappUrl, '_blank');
    } else {
      setError(result.error || 'Failed to resend');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">LookingFor</h1>
          <p className="text-gray-500 text-base">Post what you need. Stay protected.</p>
        </div>

        <div className="mb-6 space-y-2">
          {[
            'You approve who can chat with you',
            'No spam. No unwanted calls',
            'Your number is never shared without permission',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2 text-gray-600 text-sm">
              <ShieldCheck className="text-teal-500 w-4 h-4 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-400">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 border-r border-gray-300 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 px-3 py-3 outline-none text-gray-800 text-sm"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">10-digit number without country code</p>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50"
                style={{ background: '#4db6ac' }}
              >
                <span>📱</span>
                {loading ? 'Sending...' : 'Send Code via WhatsApp'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 bg-teal-50 p-3 rounded-lg">
                📱 Code sent to <strong>+91 {phoneNumber}</strong> via WhatsApp
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Enter 4-digit OTP</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="_ _ _ _"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-teal-400"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                  className="flex-1 border border-gray-300 py-3 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loading || code.length !== 4}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                  style={{ background: '#4db6ac' }}
                >
                  {loading ? 'Verifying...' : 'Verify ✓'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1 text-teal-600 text-sm font-medium py-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-4 space-y-1">
          <p className="text-xs text-gray-400">By continuing, you agree to our Terms & Privacy Policy</p>
          <p className="text-xs text-gray-400">Secure login powered by WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
FILE 6: src
