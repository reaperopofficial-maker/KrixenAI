import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  X
} from "lucide-react";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import toast from "react-hot-toast";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCountdown, setResetCountdown] = useState(0);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resetCountdown > 0) {
      timer = setInterval(() => setResetCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resetCountdown]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Valid email required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!isLogin && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: any) => {
    switch (error.code) {
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "Email is already in use.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password is too weak.";
      default:
        return "Authentication failed. Please try again.";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
      } else {
        const { user } = await listenToAuthResult(
          createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password,
          ),
        );
        const randomName = 'User_' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        await updateProfile(user, { displayName: randomName });
      }
    } catch (error: any) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  async function listenToAuthResult(promise: Promise<any>) {
    return promise;
  }

  const handleGoogleLog = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast.error(error.message || "Google Auth failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    if (!forgotEmail) {
      setForgotEmail(formData.email);
    }
  };

  const sendResetEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (resetCountdown > 0) {
      toast.error(`Please wait ${resetCountdown}s before resending.`);
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setResetCountdown(60);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base">
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-surface border border-inverted/10 rounded-[32px] p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-inverted/5 text-text-muted transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold mb-2">Reset Password</h3>
                <p className="text-text-secondary text-sm">
                  Enter your email address to receive a password reset link.
                </p>
              </div>

              <form onSubmit={sendResetEmail} className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-base border border-inverted/10 rounded-[16px] py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all"
                    autoFocus
                  />
                </div>

                <motion.button
                  whileHover={{ scale: (resetCountdown > 0 || isSendingReset) ? 1 : 1.02 }}
                  whileTap={{ scale: (resetCountdown > 0 || isSendingReset) ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSendingReset || resetCountdown > 0}
                  className="w-full mt-2 py-4 rounded-pill bg-gradient-to-r from-primary-blue to-secondary-violet text-white font-bold tracking-wide shadow-[0_0_20px_rgba(79,142,247,0.3)] disabled:opacity-70 flex justify-center items-center h-14"
                >
                  {isSendingReset ? (
                    <div className="w-5 h-5 border-2 border-inverted/30 border-t-white rounded-full animate-spin" />
                  ) : resetCountdown > 0 ? (
                    `Resend Request (${resetCountdown}s)`
                  ) : (
                    "Send Request"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="w-full max-w-sm rounded-[32px] p-8 pb-12 relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-blue rounded-full blur-2xl opacity-10 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary-violet rounded-full blur-2xl opacity-10 pointer-events-none" />

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }} className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary-blue to-secondary-violet p-[1.5px]">
            <div className="w-full h-full bg-surface rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-blue" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary-blue to-secondary-violet bg-clip-text text-transparent">
              Krixen
            </span>
            <span className="text-white">AI</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Unlock your creativity
          </p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }} className="relative z-10 bg-surface/50 p-1 rounded-2xl mb-8 flex border border-inverted/5 backdrop-blur-md">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrors({});
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${isLogin ? "bg-elevated text-primary-blue shadow-lg" : "text-text-secondary hover:text-text-primary"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrors({});
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${!isLogin ? "bg-elevated text-secondary-violet shadow-lg" : "text-text-secondary hover:text-text-primary"}`}
          >
            Sign Up
          </button>
        </motion.div>

        <motion.form
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col gap-4"
        >
          {/* Name input has been removed to auto-generate usernames */}

          <div className="flex flex-col gap-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-muted" />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-surface border ${errors.email ? "border-red-500/50" : "border-inverted/10"} rounded-[16px] py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all`}
              />
            </div>
            {errors.email && (
              <span className="text-red-400 text-xs pl-2">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-surface border ${errors.password ? "border-red-500/50" : "border-inverted/10"} rounded-[16px] py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-xs pl-2">
                {errors.password}
              </span>
            )}
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-surface border ${errors.confirmPassword ? "border-red-500/50" : "border-inverted/10"} rounded-[16px] py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all`}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-red-400 text-xs pl-2">
                    {errors.confirmPassword}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isLogin && (
            <div className="flex justify-end mt-[-8px]">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary-blue hover:text-primary-blue/80 font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 rounded-pill bg-gradient-to-r from-primary-blue to-secondary-violet text-white font-bold tracking-wide shadow-[0_0_20px_rgba(79,142,247,0.3)] disabled:opacity-70 flex justify-center items-center h-14"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-inverted/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </motion.button>
        </motion.form>

        <div className="relative z-10 mt-8 mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-inverted/5" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-base px-4 text-text-muted">
              Or continue with
            </span>
          </div>
        </div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }} className="relative z-10 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLog}
            type="button"
            disabled={loading}
            className="flex-1 bg-surface border border-inverted/10 rounded-xl py-3.5 flex items-center justify-center hover:bg-elevated transition-colors"
          >
            {/* Google SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
