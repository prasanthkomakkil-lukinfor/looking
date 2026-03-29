import { useState } from 'react';
import { MessageCircle, ArrowRight, Shield } from 'lucide-react';
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

  // ✅ SEND OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await sendOTP(phoneNumber);

    if (result.success && result.whatsappUrl) {
      setStep('code');
      window.open(result.whatsappUrl, '_blank');
    } else {
      setError(result.error || 'Failed to generate code');
    }

    setLoading(false);
  };

  // ✅ VERIFY OTP (FIXED)
  const handleVerify = async () => {
    setLoading(true);
    setError('');

    const result = await verifyOTP(phoneNumber, code);

    console.log("VERIFY RESULT:", result);

    if (result.success) {
      alert("Login successful ✅");
      onLoginSuccess();
    } else {
      setError(result.error || 'Verification failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">LookingFor</h1>

        <div className="bg-white p-6 rounded-xl shadow">

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="Enter mobile number"
                className="w-full p-3 border rounded"
                required
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-green-600 text-white p-3 rounded"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

            </form>
          ) : (
            <div className="space-y-4">

              <p className="text-sm text-gray-600">
                Code sent to +91 {phoneNumber}
              </p>

              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="Enter OTP"
                className="w-full p-3 border rounded text-center text-xl"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                    setError('');
                  }}
                  className="flex-1 border p-3 rounded"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loading || code.length !== 4}
                  className="flex-1 bg-green-600 text-white p-3 rounded"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
