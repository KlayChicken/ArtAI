import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from 'axios';

import caver from './CaverChrome';

import chickABI from '../contract/Chick.json';
import artABI from '../contract/ArtAI.json';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import question_data from '../data/questions';

import SimpleModal from './SimpleModal';

import useInput from '../hook/useInput';

function Ai() {

    const { klaytn } = window;
    const context = useOutletContext();
    const navigate = useNavigate();

    const chick_con = new caver.klay.Contract(chickABI.abi, '0xCD120f771c94FC3aBfd3717e911c2cF2639b3E53');
    const art_con = new caver.klay.Contract(artABI.abi, '0x0bfdfa293b30f89520a4fcce4688774dc853e05f');

    const [modalBool, setModalBool] = useState(false);

    const [word, onChangeWord] = useInput('')
    const [status, setStatus] = useState(0);
    const [step, setStep] = useState(0);
    const [elements, setElements] = useState(['', '', null, null, null, null, null, null, null]);
    const [current, setCurrent] = useState(null);

    const [swapLoading, setSwapLoading] = useState(false);

    const syncCurrent = (_step) => {
        setCurrent(elements[_step])
    }

    const next_status = () => {
        setStatus(status + 1)
    }

    const previous_status = () => {
        if (status === 0 || status === 1) return
        setStatus(status - 1)
    }

    const next_step = () => {
        setStep(step + 1);
    }

    const previous_step = () => {
        if (step === 0 || step === 1) return
        setStep(step - 1);
    }

    const warning_alert = () => {
        setModalBool(true);
        setTimeout(() => setModalBool(false), 950);
    }

    const go_next = () => {
        syncCurrent(step + 1);
        switch (status) {
            case 0:
                next_status();
                next_step();
                break;
            case 1:
                if (word.length < 1) {
                    warning_alert();
                    return
                }
                next_status();
                next_step();
                const _elements = elements;
                _elements[1] = word;
                setElements(_elements);
                break;
            default:
                if (elements[step] === null) {
                    warning_alert();
                    return
                }
                if (step === 7) next_status();
                next_step();
                break;
        }
    }

    const go_previous = () => {
        if (step !== 0 && step !== 1) {
            syncCurrent(step - 1);
        }

        switch (status) {
            case 0:
                break;
            case 1:
                break;
            case 3:
                previous_status();
                previous_step();
                break;
            default:
                if (step === 2) previous_status();
                previous_step();
                break;
        }
    }

    const selectChoice = (_step, _num) => {
        const _elements = elements;
        _elements[_step] = _num;
        setElements(_elements)
        setCurrent(_num)
    }

    const submit = async () => {

        try {
            setSwapLoading(true);

            let _address;

            if (context.address !== null) {
                _address = context.address;
            } else {
                const what = await context.wallet_connect();

                if (what) {
                    _address = what
                } else {
                    setSwapLoading(false);
                    window.alert('지갑 연결이 필요합니다. 모바일의 경우 Kaikas 어플 내에서 웹사이트를 실행하면 완료하실 수 있습니다.')
                    return
                }
            }

            // const maxNum = (ethers.constants.MaxUint256).toString();

            const res1 = await chick_con.send({ from: _address, gas: 1500000 }, "approve", '0x0bfdfa293b30f89520a4fcce4688774dc853e05f', '3000000000000000000000');

            let res2;

            if (res1?.status === true) {
                res2 = await art_con.send({ from: _address, gas: 1500000 }, 'submit')
            } else {
                setSwapLoading(false);
                window.alert('트랜잭션 전송을 완료해주세요.')
                return
            }

            if (res2?.status === true) {

                // console.log(_address, res2?.transactionHash, elements)

            } else {
                setSwapLoading(false);
                window.alert('트랜잭션 전송을 완료해주세요.')
                return
            }

            // console.log('done')

            const success = await axios.post('/api/make', { address: _address, sign_value: res2?.transactionHash, data: elements })

            console.log(success)
            if (success.data) {
                setStatus(4)
            } else {
                setSwapLoading(false);
                window.alert('오류가 발생하였습니다. 만약 $CHICK이 결제가 되었다면 운영진에게 말씀해주세요.')
            }

        } catch (err) {
            setSwapLoading(false);
            console.error(err)
        }
    }

    const makeChoices = () => {
        if (step === 0 || step === 1 || step === 8) return

        if (step === 3) {
            return (
                <>
                    <span className='ai_title'>
                        Q{step}. {question_data[step]['question']}
                    </span>
                    <div className='ai_select_box'>
                        {
                            (question_data[step]['examples'][elements[2]]).map((x, i) => {
                                return (
                                    <div className={current === i ? 'ai_select_each_selected' : 'ai_select_each'} key={i} onClick={() => selectChoice(step, i)}>
                                        <div className='ai_select_image_box'>
                                            <img className='ai_select_image' src={`https://kooro.s3.ap-northeast-2.amazonaws.com/artai/2_${elements[2] + 1}_${i + 1}.png`} alt='' />
                                        </div>
                                        <span className='ai_select_each_span'>
                                            {x}
                                        </span>
                                        {
                                            elements[step] === i
                                                ?
                                                <FontAwesomeIcon className='ai_selected_icon' icon={faCircleCheck} />
                                                :
                                                <></>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='ai_button_box'>
                        <button className='ai_button' onClick={go_previous}>
                            &lt; 이전
                        </button>
                        <button className='ai_button' onClick={go_next}>
                            다음 &gt;
                        </button>
                    </div>
                </>
            )
        }

        return (
            <>
                <span className='ai_title'>
                    Q{step}. {question_data[step]['question']}
                </span>
                <div className='ai_select_box'>
                    {
                        (question_data[step]['examples']).map((x, i) => {
                            return (
                                <div className={current === i ? 'ai_select_each_selected' : 'ai_select_each'} key={i} onClick={() => selectChoice(step, i)}>
                                    <div className='ai_select_image_box'>
                                        <img className='ai_select_image' src={`https://kooro.s3.ap-northeast-2.amazonaws.com/artai/${step - 1}_${i + 1}.png`} alt='' />
                                    </div>
                                    <span className='ai_select_each_span'>
                                        {x}
                                    </span>
                                    {
                                        elements[step] === i
                                            ?
                                            <FontAwesomeIcon className='ai_selected_icon' icon={faCircleCheck} />
                                            :
                                            <></>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <div className='ai_button_box'>
                    <button className='ai_button' onClick={go_previous}>
                        &lt; 이전
                    </button>
                    <button className='ai_button' onClick={go_next}>
                        다음 &gt;
                    </button>
                </div>
            </>
        )
    }

    return (
        <div className='main_board'>
            <div className='ai_container'>
                {
                    status === 4
                        ?
                        null
                        :
                        <div className='bar_box'>
                            <span className='bar_span'>
                                {step} / 8
                            </span>
                            <div className='bar'>
                                <div style={{ width: `${(step) * 100 / 8}%` }} className='bar_progress' />
                            </div>
                        </div>
                }
                <div className='ai_semi_container'>
                    {
                        {
                            0:
                                <>
                                    <span className='ai_title'>
                                        이용방법 및 주의사항
                                    </span>
                                    <span className='ai_desc'>
                                        - 당신은 1개의 주관식과 5개의 객관식으로 이루어진 6개의 질문에 답을 작성하여 작품을 그리게 됩니다.<br />
                                        - 모든 답을 작성하고 나서, 트랜잭션 전송까지 완료하면 AI가 이미지를 생성합니다. <br />
                                        - 그림은 바로 확인할 수 없으며, 매주 수요일 오후 6시 전후에 해당 지갑으로 NFT가 발행됩니다.<br />
                                        - 답변 제출 시 3,000 $CHICK이 소모됩니다. 치키즈 NFT를 보유 시, 1,500$CHICK이 소모됩니다.<br />
                                        - 트랜잭션을 보내기 위해서는 $CHICK과 별개로 소량의 클레이(1Klay 미만)가 필요합니다.<br />
                                        - 매주 2분께는 그림이 담긴 실물 액자를 보내드립니다. 당첨자는 트위터로 공지되며, 상품 전달을 위해 개인 정보를 요청할 수 있습니다.<br />
                                        - 본 서비스는 이미지 생성 AI인 Midjourney를 기반으로 운영되는 서비스입니다.<br />
                                        - 자세한 내용은 <b className='link' onClick={() => window.open('https://klayproject.notion.site/Art-AI-Beta-01d3408710a7480bb84f6ce73a6e6eb7')}>(자세한 설명)</b>을 읽어주세요.
                                    </span>
                                    <button className='ai_button' onClick={go_next}>
                                        시작하기
                                    </button>
                                </>,
                            1:
                                <>
                                    <span className='ai_title'>
                                        Q1. 무엇을 그리고 싶으신가요?
                                    </span>
                                    <div className='ai_input_box'>
                                        <input className='ai_input' value={word} maxLength={20} placeholder='최대 20자로 적어주세요.' onChange={onChangeWord} />
                                        <span className='ai_input_desc'>
                                            - 원하는 주제 또는 개념을 명확하게 전달하는 구체적인 용어를 사용할 때 최상의 결과를 얻을 수 있습니다.
                                        </span>
                                        <span className='ai_input_desc'>
                                            - 단, 모욕적이거나 외설적인, 혹은 일반적으로 부적절하다고 여겨질 수 있는 단어를 키워드로 입력하지 마십시오. 이러한 경우 정상적인 결과물 생성에 실패할 수 있습니다.
                                        </span>
                                        <span className='ai_input_desc'>
                                            - 한글, 영어를 지원하며 영어로 적으면 의도한 바를 더욱 정확하게 전달할 수 있습니다.
                                        </span>
                                    </div>
                                    <button className='ai_button' onClick={go_next}>
                                        다음 &gt;
                                    </button>
                                </>,
                            2:
                                <>
                                    {makeChoices()}
                                </>,
                            3:
                                <>
                                    <span className='ai_title'>
                                        이미지 생성하기
                                    </span>
                                    <div className='ai_last_box'>
                                        <span className='ai_last_span'>
                                            - 완료하기를 누르면 트랜잭션을 전송합니다. (2번의 트랜잭션이 발생합니다. / 첫 번째 트랜잭션에서 3000이라는 숫자가 뜨더라도 치키즈를 보유하고 있다면 정상적으로 1500 $CHICK이 소모됩니다.)
                                        </span>
                                        <span className='ai_last_span'>
                                            - 완성된 작품은 가장 가까운 수요일에 NFT로 지급됩니다.
                                        </span>
                                        <span className='ai_last_span'>
                                            - 기타 문의사항은 <b className='link' onClick={() => window.open('https://open.kakao.com/o/gWolPXzd')}>(오픈톡방)</b>을 방문해주세요.
                                        </span>
                                        <div className='ai_last_receipt'>
                                            <span className='ai_last_receipt_span'>
                                                치키즈 보유 여부 : <b className='red'>{context.chickiz_bool ? 'O' : 'X'}</b>
                                            </span>
                                            <span className='ai_last_receipt_span'>
                                                내가 보유한 $CHICK : <b className='red'>{context.chick_bal}</b>
                                            </span>
                                            <span className='ai_last_receipt_span'>
                                                소모되는 $CHICK : <b className='red'>{context.chickiz_bool ? '1500' : '3000'}</b>
                                            </span>
                                        </div>
                                    </div>
                                    <div className='ai_button_box'>
                                        <button className='ai_button' onClick={go_previous}>
                                            &lt; 이전
                                        </button>
                                        {
                                            swapLoading
                                                ?
                                                <button className='ai_button_dead'>
                                                    <div className='loading'></div>
                                                </button>
                                                :
                                                <button className='ai_button' onClick={submit}>
                                                    완료하기
                                                </button>

                                        }
                                    </div>
                                </>,
                            4:
                                <div className='ai_finish_div'>
                                    <span className='ai_finish_span'>
                                        🎉 제출이 완료되었습니다. 가장 빠른 수요일에 작품을 받아보실 수 있습니다!
                                    </span>
                                    <Link to='/'>
                                        <button className='ai_button'>
                                            홈으로 돌아가기
                                        </button>
                                    </Link>
                                </div>
                        }[status]
                    }

                </div>
            </div>
            {
                modalBool
                    ?
                    <SimpleModal text='질문에 답변을 해야 다음으로 넘어갈 수 있습니다.' />
                    :
                    null
            }
        </div>
    )
}

export default Ai;