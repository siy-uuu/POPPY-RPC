import React from "react";
import { Link } from "react-router-dom";

export default function Titlebar() {
    return (
        <div className='block'>
            <header className='block app-region-drag fixed top-0 left-0 w-full z-50'>
                <div className='flex justify-end'>
                    <Link onClick={() => window.minimize()} className='px-3 py-2 delay-70 duration-200 hover:bg-[#6e6e6e] no-drag focus:outline outline-[#F2F2F2]'>
                        <svg xmlns='http://www.w3.org/2000/svg' height='18px' viewBox='0 -960 960 960' width='18px' fill='#FFFFFF'>
                            <path d='M200-440v-80h560v80H200Z' />
                        </svg>
                    </Link>
                    <Link onClick={() => window.close()} className='px-3 py-2 delay-70 duration-200 hover:bg-red-600 no-drag focus:outline outline-[#F2F2F2]'>
                        <svg xmlns='http://www.w3.org/2000/svg' height='18px' viewBox='0 -960 960 960' width='18px' fill='#FFFFFF'>
                            <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
                        </svg>
                    </Link>
                </div>
            </header>
        </div>
    );
}
