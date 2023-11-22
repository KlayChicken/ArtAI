import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion, faHouseChimneyWindow } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";

import caver from './CaverChrome';

import chickABI from '../contract/Chick.json';
import chickizABI from '../contract/Chickiz.json';

import logo from '../image/logo.png';

function Layout() {

    const { klaytn } = window;
    const [address, setAddress] = useState(null);
    const [network, setNetwork] = useState(null);

    const [chickiz_bool, setChickiz_bool] = useState(false);
    const [chick_bal, setChick_bal] = useState(0);

    const chick_con = new caver.klay.Contract(chickABI.abi, '0xCD120f771c94FC3aBfd3717e911c2cF2639b3E53');
    const chickiz_con = new caver.klay.Contract(chickizABI.abi, '0x56eE689E3BBbafee554618fD25754Eca6950e97E');

    const check_chickiz = async (_addr) => {
        try {
            const chickiz_bal = await chickiz_con.call("balanceOf", _addr);
            return Number(chickiz_bal) > 0 ? true : false;
        } catch (err) {
            console.error(err)
            return false
        }
    }

    const check_chick = async (_addr) => {
        try {
            const _chick_bal = await chick_con.call("balanceOf", _addr);
            const __chick_bal = Math.floor(Number(caver.utils.fromPeb(_chick_bal, 'KLAY')) * 100) / 100;
            return __chick_bal
        } catch (err) {
            console.error(err)
            return 0
        }
    }

    const connect_kaikas = async () => {
        try {
            if (klaytn) {
                const accounts = await klaytn?.enable()
                const _account = accounts[0];
                if (Number(klaytn.networkVersion) !== 8217) {
                    alert('네트워크를 메인넷으로 변경해주세요.')
                    setNetwork(Number(klaytn.networkVersion))
                    return null
                } else {
                    setAddress(_account);
                    setNetwork(Number(klaytn.networkVersion));
                    setChickiz_bool(await check_chickiz(_account));
                    setChick_bal(await check_chick(_account));
                    return _account
                }
            }
        } catch (err) {
            console.error(err);
            return null
        }
    }

    const disconnect = () => {
        setAddress(null)
        setNetwork(null)
        window.location.reload()
    }

    return (
        <div className='home'>
            <header className='header'>
                <Link to='/'>
                    <div className='header_logo_box'>
                        <img className='header_logo_image' src={logo} alt='Art ai' />
                    </div>
                </Link>
                {
                    address === null
                        ?
                        <button className='connect_button' onClick={connect_kaikas}>
                            지갑 연결하기
                        </button>
                        :
                        <button className='connect_button' onClick={disconnect}>
                            {address.substr(0, 6) + '...'}
                        </button>
                }
            </header>
            <Outlet context={{ address: address, chickiz_bool: chickiz_bool, chick_bal: chick_bal, wallet_connect: connect_kaikas }} />
            <footer className='footer'>
                <div className='footer_icon_box'>
                    <FontAwesomeIcon onClick={() => window.open('https://twitter.com/klaychicken')} className='footer_icon' icon={faTwitter} />
                    <FontAwesomeIcon onClick={() => window.open('https://discord.com/invite/75xeBYMe9x')} className='footer_icon' icon={faDiscord} />
                    <FontAwesomeIcon onClick={() => window.open('https://chickifarm.com')} className='footer_icon' icon={faHouseChimneyWindow} />
                    <FontAwesomeIcon onClick={() => window.open('https://klayproject.notion.site/Art-AI-Beta-01d3408710a7480bb84f6ce73a6e6eb7')} className='footer_icon' icon={faCircleQuestion} />

                </div>
                <span className='copyright'>
                    .
                </span>
                <span className='copyright'>
                    ⓒ 2023. Art ai Team. all rights reserved
                </span>
            </footer>
        </div>
    )
}

export default Layout;