import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const Login = () => {
    return (
        <main className='flex justify-center items-center h-fit'>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div className='mt-56'>
                <div className='text-center mb-28'>
                    <p className='font-AppleSDGothicNeoEB00 text-3xl pb-2 text-[#0C0C0C]'>로그인이 필요한 서비스입니다.</p>
                    <p className='font-AppleSDGothicNeoSB00 text-[14.5px] text-[#3d3d3d]'>로그인 후 장기간 미접속 시 재로그인이 필요합니다.</p>
                </div>

                <div className='flex justify-center'>
                    <div className='inline-block bottom-4 absolute mx-7'>
                        <button
                            onClick={() => window.api.send("login")}
                            className='flex bg-[#4167ED] px-28 py-4 text-[#F2F2F2] gap-3 font-AppleSDGothicNeoB00 rounded-2xl hover:bg-[#4152ed] delay-70 duration-200 mb-3'
                        >
                            <FontAwesomeIcon style={{ color: "#f2f2f2" }} icon={faDiscord} size='lg' />
                            <p>디스코드로 로그인</p>
                        </button>
                        <a
                            onClick={() =>
                                window.api.send("open_browser", "https://github.com/siy-uuu/POPPY/blob/main/%EB%BD%80%EC%82%90%20%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EB%B0%A9%EC%B9%A8.md")
                            }
                            className='flex px-4 py-3 font-AppleSDGothicNeoSB00 text-neutral-500 hover:font-AppleSDGothicNeoB00 delay-70 duration-100 justify-center items-center'
                        >
                            개인정보 처리방침
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;
