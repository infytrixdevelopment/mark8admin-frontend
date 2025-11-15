// src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@mui/joy';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppLogoBlack from '../../pages/LoginPage/AppLogoBlack';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import Visibility from "../../ui/icons/Small/Visibility.svg";
import VisibilityOff from "../../ui/icons/Small/VisibilityOff.svg";

// Your Central Auth Backend URL
const AUTH_API_URL = 'https://mark8auth-backend-55b233081f2d.herokuapp.com';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const asianReview = `Working with Infytrix has been a valuable experience for us. Their market research and targeted ad strategies helped us secure #1 Best Seller Ranking in multiple categories. Beyond the results, their consistent support and professional approach have made them a reliable partner in our growth. We trust Infytrix to continue delivering effective strategies, and we look forward to a long-term relationship.`;

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/users'); // Redirect to admin if token exists
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Call your Central Auth Login Endpoint
            const response = await axios.post(`${AUTH_API_URL}/api/v1/auth/login`, {
                email,
                password,
            });

            if (response.data.status === 'success') {
                // Get Data from Response
                const { token, user } = response.data.data;

                // --- CRITICAL: Check if user is ADMIN ---
                if (user.user_type !== 'ADMIN') {
                    toast.error('Access Denied: Only administrators can access this portal');
                    setIsLoading(false);
                    return;
                }

                // Save to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user_id', user.user_id);
                localStorage.setItem('full_name', user.full_name);
                localStorage.setItem('user_type', user.user_type);

                toast.success('Login Successful!');
                navigate('/users'); // Redirect to your main admin page
            } else {
                throw new Error(response.data.message || 'Login failed');
            }

        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            overflow: "hidden"
        }}>
            {/* Left Side - Login Form */}
            <div style={{
                width: "50vw",
                height: "100vh",
                backgroundColor: TEXT_PRIMARY.WHITE,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                padding: "80px"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "40px",
                    alignItems: "start"
                }}>
                    <AppLogoBlack height={26} />

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        height: "fit",
                        width: "100%"
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                        }}>
                            <div style={{
                                color: TEXT_PRIMARY.BLACK,
                                fontSize: "24px",
                                fontStyle: "normal",
                                fontWeight: 700,
                                lineHeight: "32px",
                            }}>
                                Ready to Dive In?
                            </div>

                            <div style={{
                                color: TEXT_PRIMARY.GREY,
                                fontSize: "16px",
                                fontStyle: "normal",
                                fontWeight: 500,
                                lineHeight: "20px",
                            }}>
                                Use your Admin credentials to access the portal
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px"
                            }}>
                                <div style={{
                                    fontSize: 14,
                                    fontStyle: "normal",
                                    fontWeight: 500,
                                    lineHeight: "18px",
                                    color: TEXT_PRIMARY.BLACK,
                                }}>
                                    Email ID
                                </div>
                                <Input
                                    placeholder="admin@workspace.com"
                                    value={email}
                                    className="flex px-4 py-5 items-center self-stretch gap-6 rounded-[8px]"
                                    sx={{
                                        "--Input-focusedThickness": "0px",
                                        height: "52px",
                                        border: `1px solid #D1D5F1`,
                                        fontSize: 14,
                                        fontWeight: 400,
                                        lineHeight: "20px",
                                        backgroundColor: TEXT_PRIMARY.WHITE,
                                        boxShadow: "none",
                                    }}
                                    name="email"
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px"
                            }}>
                                <div style={{
                                    fontSize: 14,
                                    fontStyle: "normal",
                                    fontWeight: 500,
                                    lineHeight: "18px",
                                    color: TEXT_PRIMARY.BLACK,
                                }}>
                                    Password
                                </div>
                                <Input
                                    placeholder="Your Password"
                                    value={password}
                                    className="flex px-4 py-5 items-center self-stretch gap-6 rounded-[8px]"
                                    sx={{
                                        "--Input-focusedThickness": "0px",
                                        height: "52px",
                                        border: `1px solid #D1D5F1`,
                                        fontSize: 14,
                                        fontWeight: 400,
                                        lineHeight: "20px",
                                        backgroundColor: TEXT_PRIMARY.WHITE,
                                        boxShadow: "none",
                                        paddingRight: "16px"
                                    }}
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    endDecorator={
                                        <div style={{
                                            padding: "8px 0px 8px 0px",
                                            cursor: "pointer"
                                        }} onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <div style={{
                                                    display: "flex",
                                                    width: "20px",
                                                    height: "20px",
                                                    padding: "4.167px 1.667px",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}>
                                                    <img src={VisibilityOff} alt="Visibility Off" />
                                                </div>)
                                                : (<img src={Visibility} alt="Visibility" />)}
                                        </div>
                                    }
                                />
                            </div>

                            <Button
                                type="submit"
                                sx={{
                                    height: "48px",
                                    width: "100%",
                                    backgroundColor: "#8E59FF",
                                    padding: "0px 6px",
                                    ":hover": {
                                        backgroundColor: "#8E59FF"
                                    }
                                }}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Log In
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Image with Review */}
            <div style={{
                width: "50vw",
                height: "100vh",
                position: "relative"
            }}>
                <img src={"/loginPage.jpg"} alt="Login Image" style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                }} />

                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: "100%",
                    backgroundColor: "inherit",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    paddingBottom: "40px",
                    background: "linear-gradient(180deg, rgba(28, 28, 30, 0) 31.05%, #1C1C1E 100%)"
                }}>
                    <div style={{
                        display: "flex",
                        width: "640px",
                        padding: "24px",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "24px",
                        borderRadius: "8px",
                        border: `1px solid ${TEXT_PRIMARY.WHITE}`
                    }}>
                        <p style={{
                            color: TEXT_PRIMARY.WHITE,
                            fontSize: "16px",
                            fontStyle: "italic",
                            fontWeight: 500,
                            lineHeight: "24px",
                        }}>
                            {asianReview}
                        </p>

                        <div style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "flex-start"
                            }}>
                                <div style={{
                                    color: TEXT_PRIMARY.WHITE,
                                    fontSize: "16px",
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    lineHeight: "20px",
                                }}>
                                    Mrs. Kiran Jindal
                                </div>

                                <div style={{
                                    color: "var(--Text-Primary-Grey, #656981)",
                                    font: "Inter, sans-serif",
                                    fontSize: "10px",
                                    fontStyle: "normal",
                                    fontWeight: 500,
                                    lineHeight: "10px",
                                    letterSpacing: "1.6px",
                                    textTransform: "uppercase",
                                }}>
                                    Director, Asian Footwears
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                gap: "4px"
                            }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" key={i}>
                                        <path d="M10.6328 1.12969L12.7359 5.92656C12.8151 6.10706 12.9412 6.26302 13.1012 6.37817C13.2611 6.49332 13.449 6.56346 13.6453 6.58125L18.7687 7.04063C19.3484 7.125 19.5797 7.83594 19.1594 8.24531L15.3 11.4875C14.9875 11.75 14.8453 12.1625 14.9312 12.5609L16.0531 17.8125C16.1516 18.3891 15.5469 18.8297 15.0281 18.5562L10.5562 15.9375C10.3876 15.8385 10.1956 15.7862 9.99999 15.7862C9.80442 15.7862 9.61239 15.8385 9.44374 15.9375L4.97187 18.5547C4.45468 18.8266 3.84843 18.3875 3.94687 17.8109L5.06874 12.5594C5.15312 12.1609 5.01249 11.7484 4.69999 11.4859L0.839054 8.24687C0.420304 7.83906 0.651554 7.12656 1.22968 7.04219L6.35312 6.58281C6.5494 6.56502 6.73732 6.49489 6.89727 6.37973C7.05722 6.26458 7.18334 6.10862 7.26249 5.92812L9.36562 1.13125C9.62655 0.60625 10.3734 0.60625 10.6328 1.12969Z" fill="#FDD835" />
                                        <path d="M10.4797 6.21426L10.1234 2.67988C10.1094 2.48301 10.0687 2.14551 10.3844 2.14551C10.6344 2.14551 10.7703 2.66582 10.7703 2.66582L11.8391 5.50332C12.2422 6.58301 12.0766 6.95332 11.6875 7.17207C11.2406 7.42207 10.5812 7.22676 10.4797 6.21426Z" fill="#FFFF8D" />
                                        <path d="M14.8875 11.1732L17.9532 8.78105C18.1047 8.65449 18.3782 8.45293 18.1594 8.22324C17.986 8.04199 17.5172 8.30293 17.5172 8.30293L14.8344 9.35137C14.0344 9.62793 13.5032 10.0373 13.4563 10.5529C13.3954 11.2404 14.0125 11.7701 14.8875 11.1732Z" fill="#F4B400" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;