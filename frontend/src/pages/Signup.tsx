import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { tokenState } from "../store/atoms/auth";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import zxcvbn, { ZXCVBNResult } from 'zxcvbn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<ZXCVBNResult | null>(null);
  const [error, setError] = useState({
    username: "",
    email: "",
    password: "",
    message: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [otpStr, setOtpStr] = useState<string>("");
  const [token, setToken] = useState<string>("");
  
  const setTokenState = useSetRecoilState(tokenState);
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(zxcvbn(newPassword));
  };
  
  const strengthMeterColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-yellow-500';
      case 2:
        return 'bg-yellow-300';
      case 3:
        return 'bg-green-300';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/v1/user/signup", {
        username,
        email,
        password,
      });
      console.log(response);
      setUserId(response.data?.user?.id);
    } catch (e) {
      const axiosError = e as AxiosError<{
        error: {
          message: string;
        };
      }>;
      setError((prevError) => {
        if (axiosError?.response?.data?.error)
          return axiosError?.response?.data?.error as typeof prevError;
        prevError.message = "An unexpected error occurred";
        return prevError;
      });
    }
  };

  const handleOtpSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/v1/user/verify", {
        userId,
        otp: parseInt(otpStr),
        username: username
      });
      console.log(response);
      setToken(response.data?.token);
      setTokenState(response.data?.token);
      localStorage.setItem("token", token || "");
      navigate('/app');
    } catch (e) {
      const axiosError = e as AxiosError<{
        error: {
          message: string;
        };
      }>;
      setError((prevError) => {
        if (axiosError?.response?.data?.error)
          return axiosError?.response?.data?.error as typeof prevError;
        prevError.message = "An unexpected error occurred";
        return prevError;
      });
    }
  };

  return (
    <section className="flex justify-center p-10 md:bg-grey-500">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h2 className="text-3xl font-bold mb-4 text-white text-center">
            Sign Up
          </h2>
          <p className="text-lg font-semibold mb-2 text-red-600 text-center">
            {error.message}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-200">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-input mt-1 p-2 block w-full rounded-lg bg-gray-700 text-white"
                value={username}
                placeholder="John Doe"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <p className="text-sm font-semibold mb-2 text-red-600">
              {error.username}
            </p>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-200">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input mt-1 p-2 block w-full rounded-lg text-white bg-gray-700"
                placeholder="john@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm font-semibold mb-2 text-red-600">
                {error.email}
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-200 relative">
                Password
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input mt-1 p-2 block w-full rounded-lg text-white bg-gray-700"
                  placeholder="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                  )}
                </span>
              </label>
              {passwordStrength && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className={`h-2.5 rounded-full ${strengthMeterColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength.score]}
                  </p>
                </div>
              )}
              <ul className="list-none text-gray-400 text-sm mt-2">
                <li className="text-sm">
                  <span className="low-upper-case">
                    <FontAwesomeIcon
                      icon={
                        /([a-z].*[A-Z])|([A-Z].*[a-z])/.test(password)
                          ? faCheck
                          : faCircle
                      }
                      className={
                        /([a-z].*[A-Z])|([A-Z].*[a-z])/.test(password)
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }
                    />
                    &nbsp;Lowercase & Uppercase
                  </span>
                </li>
                <li className="text-sm">
                  <span className="one-number">
                    <FontAwesomeIcon
                      icon={/([0-9])/.test(password) ? faCheck : faCircle}
                      className={
                        /([0-9])/.test(password) ? 'text-green-600' : 'text-gray-400'
                      }
                    />
                    &nbsp;Number (0-9)
                  </span>
                </li>
                <li className="text-sm">
                  <span className="one-special-char">
                    <FontAwesomeIcon
                      icon={/([!,%,&,@,#,$,^,*,?,_,~])/.test(password) ? faCheck : faCircle}
                      className={
                        /([!,%,&,@,#,$,^,*,?,_,~])/.test(password) ? 'text-green-600' : 'text-gray-400'
                      }
                    />
                    &nbsp;Special Character (!@#$%^&*)
                  </span>
                </li>
                <li className="text-sm">
                  <span className="eight-character">
                    <FontAwesomeIcon
                      icon={password.length > 7 ? faCheck : faCircle}
                      className={
                        password.length > 7 ? 'text-green-600' : 'text-gray-400'
                      }
                    />
                    &nbsp;At least 8 Characters
                  </span>
                </li>
              </ul>
            </div>
            <p className="text-sm font-semibold mb-2 text-red-600">
              {error.password}
            </p>
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                disabled={userId !== null}
              >
                Get OTP
              </button>
            </div>
          </form>
          <div className="mt-4">
            <label htmlFor="otp" className="block text-gray-200">
              OTP
            </label>
            <div className="w-full h-fit flex items-center justify-between">
              <input
                type="text"
                id="otp"
                className="form-input h-10 mt-1 p-2 w-[65%] rounded-lg bg-gray-700 text-white"
                placeholder="Enter 6 digit OTP here"
                value={otpStr}
                disabled={!userId}
                onChange={(e) => setOtpStr(e.target.value)}
                required
              />
              <button
                className={`bg-blue-500 h-10 text-white py-2 px-4 rounded-md ${!userId ? 'cursor-not-allowed bg-blue-300 text-rose-500' : 'hover:bg-blue-600'}`}
                onClick={handleOtpSubmit}
                disabled={!userId}
              >
                Verify OTP
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-white">
            Already have an account?{" "}
            <Link to="/app/signin" className="text-blue-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signup;
