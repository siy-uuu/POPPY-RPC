import React, { useEffect, useState } from "react";

const convertTime = function (duration) {
    let seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    const format = (unit) => (unit < 10 ? "0" + unit : unit);

    hours = format(hours);
    minutes = format(minutes);
    seconds = format(seconds);

    return duration < 3600000 ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
};

const Main = () => {
    const [username, setUsername] = useState("Unknown User");
    const [profile, setProfile] = useState("https://poppymusic.xyz/static/images/default.png");

    const [rpcStatus, setRPCStatus] = useState("#F2F2F2");

    const [title, setTitle] = useState("POPPY MUSIC");
    const [artist, setArtist] = useState("재생 대기 중");
    const [url, setUrl] = useState("https://poppymusic.xyz/");
    const [duration, setDuration] = useState(0);
    const [length, setLength] = useState(0);
    const [image, setImage] = useState("https://poppymusic.xyz/static/images/Poppy.jpg");

    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        window.api.receive("localStorage", (data) => {
            switch (data?.type) {
                case "get":
                    break;

                case "set":
                    break;

                case "delete":
                    break;
            }
        });

        window.api.receive("user", (user) => {
            setUsername(user.global_name ? user.global_name : user.username);
            if (user.avatar !== "null" && user.avatar !== null) setProfile(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`);
        });

        window.api.receive("update", (data) => {
            console.log(data);
            clearInterval(intervalId);

            setTitle(data?.track?.title || "POPPY MUSIC");
            setArtist(data?.track?.author || "재생 대기 중");
            setUrl(data?.track?.uri || "https://poppymusic.xyz/");
            setDuration(data?.track?.position || 0);
            setLength(data?.track?.length || 0);
            setImage(data?.track?.artworkUrl || "https://poppymusic.xyz/static/images/Poppy.jpg");

            document.body.style.backgroundImage = `url(${data?.track?.artworkUrl || "https://poppymusic.xyz/static/images/Poppy.jpg"})`;

            switch (data.type) {
                case "Playing":
                    let interval = setInterval(() => {
                        setDuration((currentDuration) => {
                            if (currentDuration + 1000 >= data.track.length) {
                                clearInterval(interval);
                                return data.track.length;
                            }
                            return currentDuration + 1000;
                        });
                    }, 1000);

                    setIntervalId(interval);
                    break;

                case "Pause":
                    clearInterval(intervalId);
                    break;
            }
        });

        const originalStyle = {
            backgroundImage: document.body.style.backgroundImage,
            backdropFilter: document.body.style.backdropFilter,
            backgroundRepeat: document.body.style.backgroundRepeat,
            backgroundSize: document.body.style.backgroundSize,
        };

        document.body.style.backgroundImage = `url(${image})`;
        document.body.style.backdropFilter = "blur(85px)";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "1500% 450%";

        const restoreOriginalStyle = () => {
            document.body.style.backgroundImage = originalStyle.backgroundImage || "";
            document.body.style.backdropFilter = originalStyle.backdropFilter || "";
            document.body.style.backgroundRepeat = originalStyle.backgroundRepeat || "";
            document.body.style.backgroundSize = originalStyle.backgroundSize || "";
        };

        return () => {
            clearInterval(intervalId);
            restoreOriginalStyle();
            window.api.removeListener("user");
            window.api.removeListener("update");
        };
    }, [image, intervalId]);

    useEffect(() => {
        const progressElement = document.getElementById("progress");
        if (progressElement) {
            progressElement.style.width = `${(duration >= length ? 1 : duration / length) * 100}%`;
        }
    }, [duration, length]);

    return (
        <main className='h-screen'>
            <div className='absolute inset-0 backdrop-blur bg-[#292929] bg-opacity-45' />
            <div className='relative z-10 justify-center text-center'>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div className='mx-12 pt-14 grid py-5 justify-center'>
                    <img alt='song-image' src={image} className='rounded-3xl shadow-xl w-[355px] h-[355px] object-contain' />
                    <div>
                        <div className='flex mt-8 items-center justify-between'>
                            <div className='grid text-left'>
                                <p className='text-[#F2F2F2] font-AppleSDGothicNeoSB00 text-xl text-clip overflow-hidden whitespace-nowrap'>{title}</p>
                                <p className='text-[#d6d6d6] font-AppleSDGothicNeoM00 text-sm whitespace-nowrap'>{artist}</p>
                            </div>

                            <div className='ml-4 flex items-center gap-4'>
                                <button onClick={() => window.api.send("open_browser", url)} className='px-2.5 py-2.5 rounded-xl delay-100 duration-300 hover:shadow-[inset_0.5px_0.5px_10px_#696969]'>
                                    <svg xmlns='http://www.w3.org/2000/svg' height='26px' viewBox='0 -960 960 960' width='26px' fill='#F2F2F2'>
                                        <path d='M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z' />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        window.api.send("rpc");
                                        rpcStatus !== "#F2F2F2" ? setRPCStatus("#F2F2F2") : setRPCStatus("#b5b5b5");
                                    }}
                                    className='px-2.5 py-2.5 rounded-xl delay-100 duration-300 hover:shadow-[inset_0.5px_0.5px_10px_#696969]'
                                >
                                    <svg xmlns='http://www.w3.org/2000/svg' height='26px' viewBox='0 -960 960 960' width='26px' fill={rpcStatus}>
                                        <path d='M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z' />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className='mt-6'>
                            <div className='w-[100%] h-2 bg-[#e6e6e6] bg-opacity-40 rounded-3xl justify-center text-center'>
                                <div id='progress' class='bg-[#dad9d9] h-2 rounded-full duration-200' style={{ width: "0%" }} />
                            </div>
                            <div className='mx-0.5 mt-1.5 flex justify-between font-AppleSDGothicNeoM00 text-[13px] text-[#F2F2F2]'>
                                <p>{convertTime(duration)}</p>
                                <p>{convertTime(length)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='fixed bottom-2 w-full'>
                    <div className='flex items-center mx-4 py-1.5 px-2.5 rounded-[13.5px] justify-between'>
                        <div className='flex items-center gap-2.5'>
                            <img alt='user-image' src={profile} height={30} width={30} className='rounded-full' />
                            <p className='font-AppleSDGothicNeoM00 text-[15px] leading-[20px] text-[#F2F2F2]'>{username}</p>
                        </div>
                        <button
                            onClick={() => window.api.send("logout")}
                            className='text-xs items-center py-1.5 px-2 rounded-lg border-1 border-red-500 border-solid delay-70 duration-200 hover:text-white hover:bg-red-600 focus:outline outline-[#F2F2F2]'
                        >
                            <p className='font-AppleSDGothicNeoSB00 text-[#F2F2F2]'>로그아웃</p>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Main;
