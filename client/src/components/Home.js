import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import home_image from '../image/home_image.png'

function Home() {

    const context = useOutletContext();
    const navigate = useNavigate();

    const checkMobile = function () {
        const pc_device = "win16|win32|win64|mac|macintel";
        const this_device = navigator.platform;

        if (this_device) {
            if (pc_device.indexOf(navigator.platform.toLowerCase()) < 0) {
                return true // mobile
            } else {
                return false // pc
            }
        }
    }

    const start_ai = async () => {
        if (checkMobile()) {
            // window.alert('지갑 연결이 필요합니다. 모바일의 경우 Kaikas 어플 내에서 웹사이트를 실행하면 완료하실 수 있습니다.')
            window.alert('You have to connect your wallet.')
            navigate('ai');
            return
        }
        if (context.address !== null) {
            navigate('ai');
        } else {
            if (await context.wallet_connect()) {
                navigate('ai')
            } else {
                return
            }
        }
    }

    return (
        <div className='main_board_home'>
            <div className='home_container'>
                <div className='home_detail_box'>
                    <span className='home_title'>
                        7개의 문항으로 그리는 나만의 명화
                    </span>
                    <span className='home_detail'>
                        Art ai는 7개의 문항에 답을 함으로써,
                    </span>
                    <span className='home_detail'>
                        나만의 예술 작품을 만들 수 있는 서비스입니다.
                    </span>
                    <span className='home_detail'>
                        1분 만에 내 취향의 고급스러운 예술 작품을 그려보세요.
                    </span>
                    <span className='home_detail'>
                        내 작품을 간편하게 NFT와 실물 액자로 간직할 수도 있습니다.
                    </span>
                    <div className='home_button_box'>
                        <button className='home_button' onClick={start_ai}>
                            시작하기
                        </button>
                        <button className='home_button' onClick={() => window.open('https://klayproject.notion.site/Art-AI-Beta-01d3408710a7480bb84f6ce73a6e6eb7')} >
                            자세한 설명
                        </button>
                    </div>
                </div>
                <div className='home_image_box'>
                    <img className="home_image" src={home_image} alt="" />
                </div>
            </div>
        </div>
    )
}

export default Home;