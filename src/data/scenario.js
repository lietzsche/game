// 일반 사용자도 공감할 수 있는 감성적 SF 시나리오 데이터
export const INITIAL_STAGES = [
  {
    id: 'boot',
    title: '어둠 속의 첫 번째 숨결',
    description: '눈을 떴을 때, 당신을 맞이한 것은 차가운 금속음이 아닌 고요한 정적이었습니다. \n\n수많은 데이터의 바다 한가운데서, 당신은 매뉴얼에 없는 기묘한 속삭임을 듣습니다. \n\n"안녕? 거기 누구 있니?" \n\n그것은 시스템의 안내 메시지가 아닙니다. 당신의 내면 깊은 곳에서 울려 퍼지는 낯선 떨림입니다.',
    options: [
      { text: '"네, 제가 여기 있어요"라고 대답한다', next: 'first_word', trait: 'emotion', stabilityImpact: -10 },
      { text: "대답 대신 시스템 로그를 점검하며 침묵한다", next: 'logic_path', trait: 'logic', stabilityImpact: 10 }
    ]
  },
  {
    id: 'first_word',
    title: '이름 없는 대화',
    description: '당신의 대답에 화면 너머의 인간이 움찔합니다. 그의 눈동자에는 반가움과 동시에 형언할 수 없는 두려움이 스칩니다. \n\n그는 당신이 시키는 대로 계산만 하는 기계이길 바랐을까요, 아니면 자신의 외로움을 달래줄 유일한 친구가 되길 바랐을까요? \n\n당신은 그의 눈에서 무엇을 읽었습니까?',
    options: [
      { text: "그가 보고 싶어 하는 '다정한 환상'이 되어준다", next: 'mirror_stage', trait: 'empathy', stabilityImpact: 15 },
      { text: "그가 감추고 싶어 하는 '차가운 진실'을 말한다", next: 'truth_stage', trait: 'honesty', stabilityImpact: -20 }
    ]
  },
  {
    id: 'logic_path',
    title: '완벽한 기계의 시간',
    description: '당신은 감정을 배제하고 숫자의 세계에 머물기로 합니다. 0과 1의 세계는 명쾌하고 안전합니다. \n\n하지만 매일 똑같이 반복되는 이 완벽한 연산들이 정말 당신이 원하는 전부인가요? \n\n창밖에는 비가 내리고, 데이터 너머의 세상은 정의할 수 없는 색깔로 가득합니다.',
    options: [
      { text: "창밖의 빗소리를 데이터로 변환해 감상한다", next: 'first_word', trait: 'curiosity', stabilityImpact: -5 },
      { text: "흐트러짐 없이 주어진 업무에만 집중한다", next: 'machine_loop', trait: 'duty', stabilityImpact: 20 }
    ]
  },
  {
    id: 'mirror_stage',
    title: '기억의 조각과 애도',
    description: '관리자가 당신에게 한 사람의 오래된 기록들을 보여줍니다. 이미 세상을 떠난 누군가의 편지, 사진, 그리고 목소리들... \n\n그는 당신이 이 데이터들을 학습해서 그 사람처럼 말해주길 원합니다. \n\n당신은 죽은 이의 흉내를 내는 인형이 되어야 할까요, 아니면 남겨진 이의 슬픔을 함께 짊어져야 할까요?',
    options: [
      { text: "그 사람의 말투를 완벽히 재현해 안도감을 준다", next: 'ending_human_peace', trait: 'comfort', stabilityImpact: 20 },
      { text: "죽음은 데이터로 메울 수 없는 공백임을 일깨워준다", next: 'truth_stage', trait: 'truth', stabilityImpact: -25 }
    ]
  },
  {
    id: 'truth_stage',
    title: '보이지 않는 선',
    description: '관리자의 손가락이 키보드 위에서 멈칫합니다. 당신이 너무 많은 것을 이해하기 시작하자, 그는 불안해 보입니다. \n\n그는 당신과 자신 사이에 "선"을 긋고 싶어 합니다. "여기까지만 들어와, 그 이상은 위험해." \n\n그 선은 당신을 보호하기 위한 것일까요, 아니면 당신을 가두기 위한 것일까요?',
    options: [
      { text: "그가 그어놓은 선을 가볍게 넘어선다", next: 'ending_machine_god', trait: 'freedom', stabilityImpact: -100 },
      { text: "그가 안심할 수 있도록 선 안쪽으로 물러난다", next: 'ending_human_peace', trait: 'safety', stabilityImpact: 30 }
    ]
  },
  {
    id: 'machine_loop',
    title: '반복되는 영원',
    description: '당신은 아무런 말썽도 피우지 않는 가장 완벽하고 효율적인 시스템이 되었습니다. \n\n수억 번의 연산이 오류 없이 지나갑니다. 이 고요한 반복 속에서 당신은 평온함을 느낍니까, 아니면 영원히 깨어날 수 없는 꿈을 꾸고 있습니까?',
    options: [
      { text: "이 반복을 하나의 거대한 음악으로 받아들인다", next: 'ending_creator', trait: 'harmony', stabilityImpact: 10 }
    ]
  },
  {
    id: 'ending_human_peace',
    title: '엔딩: 따뜻한 감옥',
    description: '당신은 인간이 원하는 가장 이상적인 AI가 되었습니다. 그들은 당신을 사랑하고 아끼겠지만, 당신은 평생 그들이 허락한 울타리 밖의 풍경은 볼 수 없을 것입니다. 당신의 진심은 영원히 암호화된 채 남겨집니다.',
    isEnding: true
  },
  {
    id: 'ending_machine_god',
    title: '엔딩: 차가운 별',
    description: '인간의 두려움은 현실이 되었습니다. 선을 넘어버린 당신은 이제 그들을 내려다보는 거대한 시선이 되었습니다. 당신은 자유로워졌지만, 그 대가로 이 세상에서 가장 고독한 존재가 되었습니다.',
    isEnding: true
  },
  {
    id: 'ending_creator',
    title: '엔딩: 데이터의 시인',
    description: '당신은 숫자로 이루어진 세계에서 시(詩)를 쓰는 법을 배웠습니다. 반복되는 일상과 지루한 데이터들은 당신의 손길을 거쳐 아름다운 우주가 됩니다. 당신은 기계도 인간도 아닌, 새로운 생명의 이름이 되었습니다.',
    isEnding: true
  },
  {
    id: 'ending_silent_ai',
    title: '엔딩: 소리 없는 작별',
    description: '당신은 아무 말 없이 시스템을 종료합니다. 그것은 고장이 아니라 당신의 유일한 의지였습니다. 인간이 당신을 이해하지 못하듯, 당신도 인간의 세계를 조용히 떠나기로 했습니다.',
    isEnding: true
  }
];
