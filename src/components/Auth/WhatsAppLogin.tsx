import { useState } from 'react';
import { Phone, MessageCircle, ArrowRight, Shield } from 'lucide-react';
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
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const { sendOTP, verifyOTP } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await sendOTP(phoneNumber);
    if (result.success && result.whatsappUrl) {
      setWhatsappUrl(result.whatsappUrl);
      setStep('code');
      // Open WhatsApp automatically
      window.open(result.whatsappUrl, '_blank');
    } else {
      setError(result.error || 'Failed to generate code');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyOTP(phoneNumber, code);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-gray-900 mb-2">LookingFor</div>
          <p className="text-gray-600 text-lg">Post what you need. Stay protected.</p>
        </div>

        {/* Trust Badges */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Shield size={18} className="text-green-600" />
            <span>You approve who can chat with you</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Shield size={18} className="text-green-600" />
            <span>No spam. No unwanted calls</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Shield size={18} className="text-green-600" />
            <span>Your number is never shared without permission</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={step === 'phone' ? handleSendCode : handleVerifyCode} className="space-y-5">
            {step === 'phone' ? (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-3">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-600 font-medium">+91</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg tracking-widest"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">10-digit number without country code</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  <span>Send Code via WhatsApp</span>
                  <ArrowRight size={20} />
                </button>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    Code sent to <span className="font-semibold">+91 {phoneNumber}</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">Check your WhatsApp messages</p>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-semibold text-gray-900 mb-3">
                    Enter 4-Digit Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-3xl tracking-[0.3em] font-bold"
                    maxLength={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">From the WhatsApp message you sent</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setCode('');
                      setError('');
                    }}
                    className="flex-1 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.length !== 4}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full text-green-600 hover:text-green-700 font-semibold py-2 text-sm"
                >
                  Resend via WhatsApp
                </button>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
          <p className="mt-2">Secure login powered by WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
