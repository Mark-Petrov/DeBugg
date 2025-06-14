import React, { useState, useEffect, useRef } from "react";
import "../styles/AuthModal.css";

export default function AuthModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isVerification, setIsVerification] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [isRecoveryCodeSent, setIsRecoveryCodeSent] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    login: "",
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordError, setPasswordError] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleVerificationChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async () => {
  const errors = {};
  if (isRegister) {
    if (!formData.email || !formData.email.includes("@")) errors.email = true;
    if (!formData.login) errors.login = true;
    if (!formData.password) errors.password = true;
  }

  setFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;

  if (isRegister) {
    try {
      const res = await fetch("/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.login,
        }),
      });
      const data = await res.json();
      if (res.ok) {

      } else {
        alert(data.message || "Ошибка регистрации");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка соединения с сервером");
    }

  } else {
    try {
      const res = await fetch("/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        onClose();
      } else {
        alert(data.message || "Ошибка входа");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка соединения с сервером");
    }
  }
  };

const handleVerificationSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("code", verificationCode);

    const res = await fetch("/account/register/verify", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const data = await res.json();
    if (res.ok) {
      alert("Почта успешно подтверждена!");
      localStorage.setItem("auth_token", data.token);
      onClose(); 
    } else {
      alert(data.message || "Неверный код. Попробуйте снова.");
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка соединения с сервером");
    }
  };

  // --- Восстановление пароля ---
  const handleRecoveryStart = () => {
    setIsRecovery(true);
    setIsRecoveryCodeSent(false);
    setIsResetPassword(false);
    setRecoveryEmail("");
    setRecoveryCode("");
    setNewPassword("");
    setNewPasswordRepeat("");
    setRecoveryError("");
    setRecoverySuccess("");
  };

  const handleSendRecoveryCode = () => {
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      setRecoveryError("Введите корректную почту.");
      return;
    }
    setRecoveryError("");
    setIsRecoveryCodeSent(true);
    setResendTimer(20);
    // Здесь должен быть запрос на отправку кода на почту

    // Запускаем таймер
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = () => {
    // Повторная отправка кода
    setResendTimer(20);
    // Здесь должен быть запрос на отправку кода на почту

    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    };
  }, []);

  const handleRecoveryCodeCheck = () => {
    if (recoveryCode === "123456") {
      setIsResetPassword(true);
      setRecoveryError("");
    } else {
      setRecoveryError("Неверный код. Попробуйте снова.");
    }
  };

  const handleResetPassword = () => {
    if (!newPassword) {
      setRecoveryError("Введите новый пароль.");
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setRecoveryError("Пароли не совпадают.");
      return;
    }
    // Здесь должен быть реальный запрос на смену пароля
    setRecoverySuccess("Пароль успешно изменён! Теперь вы можете войти.");
    setTimeout(() => {
      setIsRecovery(false);
      setIsRecoveryCodeSent(false);
      setIsResetPassword(false);
      setRecoveryError("");
      setRecoverySuccess("");
    }, 2000);
  };

  const getInputStyle = (field) => {
    if (fieldErrors[field]) return { border: "2px solid red" };
    if (formData[field]) return { border: "2px solid green" };
    return {};
  };

  return (
    <div className="auth-modal">
      <div
        className="auth-modal-content"
        style={{
          maxWidth: 200, 
          minWidth: 480,
          width: "96vw",
          boxSizing: "border-box"
        }}
      >
        <button className="close-icon" onClick={onClose}>
          &times;
        </button>
        {/* --- Восстановление пароля --- */}
        {isRecovery ? (
          <>
            <h2>Восстановление пароля</h2>
            {!isRecoveryCodeSent && !isResetPassword && (
              <>
                <input
                  type="email"
                  placeholder="Введите вашу почту"
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  style={recoveryError ? { border: "2px solid red" } : {}}
                />
                {recoveryError && <p className="error-message">{recoveryError}</p>}
                <div
                  className="button-container"
                >
                  <button
                    onClick={handleSendRecoveryCode}
                  >
                    Отправить код
                  </button>
                  <button
                    onClick={() => setIsRecovery(false)}
                  >
                    Назад
                  </button>
                </div>
              </>
            )}
            {isRecoveryCodeSent && !isResetPassword && (
              <>
                <input
                  type="text"
                  placeholder="Код из почты"
                  value={recoveryCode}
                  onChange={e => setRecoveryCode(e.target.value)}
                  style={recoveryError ? { border: "2px solid red" } : {}}
                />
                {recoveryError && <p className="error-message">{recoveryError}</p>}
                <div
                  className="button-container"
                >
                  <button
                    onClick={handleRecoveryCodeCheck}
                  >
                    Проверить код
                  </button>
                  <button
                    onClick={() => setIsRecovery(false)}
                  >
                    Назад
                  </button>
                  <button
                    className="resend-btn"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0
                      ? (
                        <>
                          <span>Отправить код повторно</span>
                          <span>({resendTimer} сек)</span>
                        </>
                      )
                      : "Отправить код повторно"}
                  </button>
                </div>
              </>
            )}
            {isResetPassword && (
              <>
                <input
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={recoveryError && !newPassword ? { border: "2px solid red" } : {}}
                />
                <input
                  type="password"
                  placeholder="Повторите новый пароль"
                  value={newPasswordRepeat}
                  onChange={e => setNewPasswordRepeat(e.target.value)}
                  style={recoveryError && newPassword !== newPasswordRepeat ? { border: "2px solid red" } : {}}
                />
                {recoveryError && <p className="error-message">{recoveryError}</p>}
                {recoverySuccess && <p style={{ color: "green", textAlign: "center" }}>{recoverySuccess}</p>}
                <div
                  className="button-container"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    justifyContent: "center",
                    gap: "24px",
                    width: "100%",
                  }}
                >
                  <button
                    style={{
                      minWidth: 140,
                      maxWidth: "100%",
                      height: 45,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    onClick={handleResetPassword}
                  >
                    Сменить пароль
                  </button>
                </div>
              </>
            )}
          </>
        ) : !isVerification ? (
          <>
            <h2>{isRegister ? "Регистрация" : "Вход"}</h2>
            {isRegister && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Почта"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={getInputStyle("email")}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={getInputStyle("password")}
                />
                <input
                  type="text"
                  name="login"
                  placeholder="Логин"
                  value={formData.login}
                  onChange={handleInputChange}
                  style={getInputStyle("login")}
                />
              </>
            )}
            {!isRegister && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Почта"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={getInputStyle("email")}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={getInputStyle("password")}
                />
              </>
            )}
            {passwordError && <p className="error-message">{passwordError}</p>}
            <div className="button-container" style={{ flexWrap: "nowrap", justifyContent: "center" }}>
              <button
                style={{
                  minWidth: 140,
                  maxWidth: "100%",
                  height: 45,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                onClick={handleSubmit}
              >
                {isRegister ? "Зарегистрироваться" : "Войти"}
              </button>
              <button
                style={{
                  minWidth: 140,
                  maxWidth: "100%",
                  height: 45,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}
              </button>
              {!isRegister && (
                <button
                  className="recover-button"
                  style={{
                    minWidth: 140,
                    maxWidth: "100%",
                    height: 45,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                  onClick={handleRecoveryStart}
                >
                  Восстановить
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h2>Подтверждение почты</h2>
            <p>Введите шестизначный код, отправленный на вашу почту.</p>
            <input
              type="text"
              placeholder="Код подтверждения"
              value={verificationCode}
              onChange={handleVerificationChange}
            />
            <div className="button-container" style={{ flexWrap: "nowrap", justifyContent: "center" }}>
              <button
                style={{
                  minWidth: 140,
                  maxWidth: "100%",
                  height: 45,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                onClick={handleVerificationSubmit}
              >
                Подтвердить
              </button>
              <button
                style={{
                  minWidth: 140,
                  maxWidth: "100%",
                  height: 45,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                onClick={() => alert("Код отправлен повторно!")}
              >
                Не пришел код
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}