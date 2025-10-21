API Key 발급하기
현재 API Key는 제한된 사용자에게만 제공하고 있습니다. API를 활용해보고 싶으신 경우 각 계열사의 담당자에게 신청하시면 담당자가 검토하여 순서대로 API Key를 발급 드릴 예정입니다. 담당자 정보는 FAQ의 두번째 질문에서 확인할 수 있습니다.

첫 API 호출하기
모든 API 요청의 기본 URL은 https://api.lgresearch.ai입니다. API는 RESTful 규칙에 따라 GET, POST, PATCH, DELETE의 요청이 가능하며, 요청 시 HTTP Header의 x-api-key 필드에 API Key를 포함하여 전송해주셔야 합니다.

API 요청 및 응답은 아래와 같이 두가지 방식을 제공합니다.

API Request Format
application/json: JSON 형식으로 본문 전송
multipart/form-data: 파일 및 문자열로 본문 전송 (JSON 문자열 포함 가능)
API Response Format
text/event-stream: Text streaming (JSON 단위 순차 전송)
application/json: 일반 응답(한 번에 JSON 인코딩하여 전송)
Example of API Request Format
JSON 형식 요청(Content-Type: application/json)
HTTP Header에 API Key와 요청 ID를 포함하고, API별로 정의된 Body message를 포함하여 요청을 전송합니다.

curl
python
javascript

curl -X 'POST' \
  'https://api.lgresearch.ai/v1/resource' \
  -H 'accept: */*' \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{
    "param1": "value1",
    "param2": "value2"
}'
                


import requests

url = "https://api.lgresearch.ai/v1/resource"
headers = {
    "Content-Type": "application/json; charset=utf-8",
    "x-api-key": "YOUR_API_KEY",
}
payload = {
    "param1": "value1",
    "param2": "value2",
}

response = requests.post(url=url, json=payload, headers=headers)
print(response.json())
                

                
x-api-key는 AI연구원에서 발급한 API Key를 포함해야 합니다.

요청 본문(body)은 API 명세에 맞춰 JSON형식으로 작성합니다.

파일/문자열 형식 요청(Content-Type: multipart/form-data)
curl
python
javascript

curl -X 'POST' \
  'https://api.lgresearch.ai/v1/resource' \
  -H 'accept: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@sample.pdf;type=application/pdf' \
  -F 'upsert=true'
                
x-api-key는 AI연구원에서 발급한 API Key를 포함해야 합니다.

요청 본문(body)은 API 명세에 맞춰 파일 혹은 문자열 (JSON 문자열 포함)을 적용하여 작성합니다.

Example of API Response Format
Streaming 형식 응답(Content-Type: text/event-stream)
Streaming 응답 방식은 서버에서 클라이언트에게 데이터를 순차적으로 전송해주는 방식입니다. 클라이언트의 경우 Stream이 중간에 잘릴 수 있으므로, 완전한 JSON 단위로 데이터를 읽고 처리해야 합니다.

json

{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "", "answer": "", "references": [{}], "progress_state": "planning"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "", "answer": "", "references": [{}], "progress_state": "optimizing"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "안녕", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "하", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "세요", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "!", "references": [{}], "progress_state": "answering"}}

...

{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "습니다", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": ".", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": " 😊", "references": [{}], "progress_state": "answering"}}
                
💡 주의: JSON이 조각난 상태로 도착할 수 있으므로, JSON 단위로 올바르게 파싱해야 합니다.
JSON 형식 응답(Content-Type: application/json)
JSON 포맷으로 인코딩 되어 result_code와 description 필드가 포함되며, API에 따라 추가적인 필드(data, files 등)가 동적으로 포함될 수 있습니다.

json

{
  "result_code": 200,
  "description": null,
  "data": {
    "query": "안녕?",
    "intent": "chitchat",
    "answer": " 😊",
    "references": [{}],
    "progress_state": "answering"
  }
}
                
Examples of API Request Success and Failure
Successful API Response
json

{
  "result_code": 200,
  "description": null
}
                  
Failed API Response
다양한 이유로 API 요청이 실패할 수 있으며, 상세한 오류는 Error Codes 페이지에서 확인 가능합니다.

json

{
  "result_code": 500,
  "description": "The service is currently experiencing a temporary issue and cannot process your request. Please try again shortly."
}
                  
Authentication
이 API Reference는 EXAONE API 플랫폼과 상호 작용할 수 있는 RESTful API에 대해 설명합니다. REST API는 HTTPS 요청을 지원하는 모든 환경에서 HTTPS를 통해 사용할 수 있습니다.

사용 예시 표준은 cURL을 통해 제공됩니다. 지정된 API KEY를 사용해야 API 활용이 가능합니다.

제공되는 API는 사용약관에 따라 사용되어야 하며, Rate Limit 등 사용정책을 벗어날 경우 정상적인 서비스 이용이 불가합니다.

API Key 인증하기
EXAONE API에 대한 모든 요청에는 x-api-key 헤더에 API 키를 포함해야 합니다.

API 키는 비밀이므로 절대 다른 사람과 공유하거나 클라이언트 측 코드(브라우저, 앱 등)에 노출하지 마세요! 운영 환경에서는 API 키를 환경 변수 또는 키 관리 서비스에서 안전하게 불러와 백엔드 서버를 통해 요청을 처리해야 합니다.

모든 API 요청에는 다음과 같이 Authorization HTTPS 헤더에 API 키를 포함해야 합니다:

예제
curl
python
javascript

curl -X 'POST' \
  'https://api.lgresearch.ai/v1/resource' \
  -H 'accept: */*' \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{
    "param1": "value1",
    "param2": "value2"
}'
                
Error Codes
HTTP 응답 코드는 일반적인 성공과 오류 클래스를 나타내는 데 사용됩니다.

성공 코드
HTTP status code	description
200	성공적으로 처리된 요청
오류 코드
오류 응답 본문의 result_code 와 description 속성에서 오류에 대한 더 구체적인 세부 정보를 확인할 수 있습니다.

HTTP status code	description
400	입력 포맷 오류 등 요청 형식이 맞지 않을 경우
401	API 키를 누락 또는 API 키 인증 및 인가 실패했을 경우
404	API 요청 경로가 없거나 컨텐츠가 없을 경우 (ex. 삭제하려는 파일이 없을 경우)
413	문서 파일의 사이즈가 허용 범위(30MB)를 초과할 경우
415	허용하지 않는 문서 파일을 요청하는 경우
422	입력 포맷 오류일 경우 (ex. query가 빈 값인 경우)
429	API 호출 횟수가 요청 제한을 초과한 경우
500	API 서비스의 내부 시스템에 문제가 발생한 경우



## Chat completion guideline
요청 정보
field	type	description	required
doc_ids	array<string>	Document QA를 위한 문서 ID 리스트	optional
query	string	사용자의 질의	mandatory
previous_message	array<object>	이전 턴의 질의 및 결과	optional
previous_message[].query	string	이전 턴의 질의	optional
previous_message[].intent	string	이전 턴의 intent값	optional
previous_message[].answer	string	이전 턴의 결과	optional
temperature	number	답변의 다양성을 조절하는 파라미터
값이 높을수록 다양한 답변을 생성함
(min: 0, max: 1.0, default=0.8)	optional
응답 정보
field	type	description
result_code	number	http status code
description	string	오류 상세 설명 (result_code가 200일 경우 null)
data	object	답변 객체
data.query	string	사용자의 질의
data.intent	string	사용자의 질의에서 시스템이 파악한 의도
data.answer	string	사용자의 질의에 대해 생성된 답변
data.references	array<object>	답변 생성에 참조한 자료 (intent에 따라 없는 경우도 있음)
data.progress_state	string	모델이 답변을 생성하는 단계 (planning, optimizing, answering 등)
Intent 정보
사용자의 질의에서 시스템이 파악한 의도로 응답 정보에 포함됩니다.

intent	type	references 유무
chitchat	일반 대화	X
code_generate	코드 생성	X
cur_weather	현재(오늘) 날씨 정보	O
document_answer	문서 QA	O
web_search	웹 검색 QA	O
weekly_weather	주간 날씨 정보	O
요청 예제
curl
python
javascript

import requests

url = "https://api.lgresearch.ai/v1/chatexaone/chat-completion"
headers = {
    "Content-Type": "application/json; charset=utf-8",
    "x-api-key": "YOUR_API_KEY",
}
previous_messages = [
    {
        "query": "안녕?",
        "answer": "안녕하세요! 무엇을 도와드릴까요? 궁금한 점이 있으면 편하게 물어보세요. 😊",
        "intent": "chitchat",
    }
]
payload = {
    "query": "무더위를 슬기롭게 극복하는 방법",
    "previous_messages": previous_messages,
    "temperature": 0.8,
}

response = requests.post(url=url, json=payload, headers=headers, stream=True)
for stream in response.iter_lines():
    if stream:
        print(stream.decode("utf-8"))
                
응답 예제
{"result_code": 200, "description": null, "data": {"query": "무더위를 슬기롭게 극복하는 방법", "intent": "", "answer": "", "references": [{}], "progress_state": "planning"}}
{"result_code": 200, "description": null, "data": {"query": "무더위를 슬기롭게 극복하는 방법", "intent": "", "answer": "", "references": [{}], "progress_state": "optimizing"}}
{"result_code": 200, "description": null, "data": {"query": "무더위를 슬기롭게 극복하는 방법", "intent": "web_search", "answer": "더위", "references": [{"card": "https://www.welfarehello.com/community/hometownNews/53c04ad7-235b-42f5-8810-099bf68d6bb7", "index": 1, "title": "무더위 극복 꿀팁! 폭염 대비 행동요령을 알려드립니다 (+폭염대비 행동요령 안내) | 인천광역시 서구 | 웰로", "contents": "안녕하세요, 서동입"}, {"card": "https://elounlife.com/%EB%8D%94%EC%9C%84-%ED%94%BC%ED%95%98%EB%8A%94-%EB%B2%95/", "index": 2, "title": "폭염 대비, 더위 피하는 법 10가지 - elounlife blog", "contents": "여름철 더위는 누구"}, {"card": "https://www.hankyung.com/news/article/201207316560i", "index": 3, "title": "무더위 속 만성피로 극복하는 방법 | 한국경제", "contents": "<strong>무더"}, {"card": "https://www.reddit.com/r/Frugal/comments/1ddsa83/how_to_beat_the_summer_heat_in_a_frugal_way/", "index": 4, "title": "r/Frugal on Reddit: How to beat the summer heat in a frugal way?", "contents": "Frugality "}, {"card": "https://www.redcross.org.uk/stories/health-and-social-care/first-aid/beat-the-hot-weather-top-tips-for-staying-cool", "index": 5, "title": "Beat the heat: top tips for how to keep cool in hot weather", "contents": "If untreat"}, {"card": "https://energized.edison.com/stories/top-5-ways-to-beat-the-heat", "index": 6, "title": "Top 5 Ways to Beat the Heat | Energized by Edison", "contents": "Cooking in"}, {"card": "https://namu.wiki/w/%ED%8F%AD%EC%97%BC", "index": 7, "title": "폭염 - 나무위키", "contents": "정말 상태가 심각한"}, {"card": "https://blog.naver.com/PostView.nhn?blogId=i4space&logNo=220377212430", "index": 8, "title": "더위 피하는 19가지 방법으로 시원한 여름대비 : 네이버 블로그", "contents": "[{\"title\":"}, {"card": "https://www.ccdn.co.kr/news/articleView.html?idxno=928246", "index": 9, "title": "[사설]숨막히는 '무더위' 슬기롭게 이겨내자", "contents": "[ 충청매일]전국에"}, {"card": "https://www.ready.gov/heat", "index": 10, "title": "Extreme Heat | Ready.gov", "contents": "If you are"}, {"card": "https://blog.naver.com/ecocitydaegu/221027314970?viewType=pc", "index": 11, "title": "무더위 건강관리 방법 :: 다가오는 여름을 대비할 수 있는 생활 ...", "contents": "당신의 모든 기록을"}, {"card": "https://m.blog.naver.com/songbiisfree/222009287005", "index": 12, "title": "더위를 피하는 간단한 방법 : 네이버 블로그", "contents": "본격적인 더위가 시"}, {"card": "http://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=a0001421128&isPc=true", "index": 13, "title": "폭염, 슬기롭게 대처합시다 - 오마이뉴스", "contents": "지구온난화가 극지방"}, {"card": "https://www.wgal.com/article/heatwave-safety-tips-signs-heat-illness/65177465", "index": 14, "title": "Tips to beat the heat and stay safe during heat waves", "contents": "Millions o"}, {"card": "https://www.betterhealth.vic.gov.au/health/healthyliving/how-to-cope-and-stay-safe-in-extreme-heat", "index": 15, "title": "How to cope and stay safe in extreme heat | Better Health Channel", "contents": "Plan ahead"}, {"card": "https://www.safetyandhealthmagazine.com/articles/25381-simple-ways-to-beat-the-heat", "index": 16, "title": "Simple ways to beat the heat | Safety+Health", "contents": "Home » Sim"}, {"card": "https://m.blog.naver.com/shhosp9804/222799449782", "index": 17, "title": "무더위 속에서 내 몸을 지키는 방법 1탄🥵 여름철 온열질환 조심하세요! : 네이버 블로그", "contents": "{\"title\":\""}, {"card": "https://m.blog.naver.com/earthwhisper/223149156976", "index": 18, "title": "[소서] 더위를 이기는 방법. 태양을 피하는 방법. 바람결, 물결이 있는 나만의 힐링장소 찾아내기! : 네이버 블로그", "contents": "{\"title\":\""}, {"card": "https://www.pima.gov/2042/Beat-the-Heat", "index": 19, "title": "Beat the Heat | Pima County, AZ", "contents": "Arizona’s "}, {"card": "https://www.nhs.uk/live-well/seasonal-health/heatwave-how-to-cope-in-hot-weather/", "index": 20, "title": "Heatwave: how to cope in hot weather - NHS", "contents": "Most of us"}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "무더위를 슬기롭게 극복하는 방법", "intent": "web_search", "answer": "", "references": [{"card": "https://www.welfarehello.com/community/hometownNews/53c04ad7-235b-42f5-8810-099bf68d6bb7", "index": 1, "title": "무더위 극복 꿀팁! 폭염 대비 행동요령을 알려드립니다 (+폭염대비 행동요령 안내) | 인천광역시 서구 | 웰로", "contents": "안녕하세요, 서동입"}, {"card": "https://elounlife.com/%EB%8D%94%EC%9C%84-%ED%94%BC%ED%95%98%EB%8A%94-%EB%B2%95/", "index": 2, "title": "폭염 대비, 더위 피하는 법 10가지 - elounlife blog", "contents": "여름철 더위는 누구"}, {"card": "https://www.hankyung.com/news/article/201207316560i", "index": 3, "title": "무더위 속 만성피로 극복하는 방법 | 한국경제", "contents": "<strong>무더"}, {"card": "https://www.reddit.com/r/Frugal/comments/1ddsa83/how_to_beat_the_summer_heat_in_a_frugal_way/", "index": 4, "title": "r/Frugal on Reddit: How to beat the summer heat in a frugal way?", "contents": "Frugality "}, {"card": "https://www.redcross.org.uk/stories/health-and-social-care/first-aid/beat-the-hot-weather-top-tips-for-staying-cool", "index": 5, "title": "Beat the heat: top tips for how to keep cool in hot weather", "contents": "If untreat"}, {"card": "https://energized.edison.com/stories/top-5-ways-to-beat-the-heat", "index": 6, "title": "Top 5 Ways to Beat the Heat | Energized by Edison", "contents": "Cooking in"}, {"card": "https://namu.wiki/w/%ED%8F%AD%EC%97%BC", "index": 7, "title": "폭염 - 나무위키", "contents": "정말 상태가 심각한"}, {"card": "https://blog.naver.com/PostView.nhn?blogId=i4space&logNo=220377212430", "index": 8, "title": "더위 피하는 19가지 방법으로 시원한 여름대비 : 네이버 블로그", "contents": "[{\"title\":"}, {"card": "https://www.ccdn.co.kr/news/articleView.html?idxno=928246", "index": 9, "title": "[사설]숨막히는 '무더위' 슬기롭게 이겨내자", "contents": "[ 충청매일]전국에"}, {"card": "https://www.ready.gov/heat", "index": 10, "title": "Extreme Heat | Ready.gov", "contents": "If you are"}, {"card": "https://blog.naver.com/ecocitydaegu/221027314970?viewType=pc", "index": 11, "title": "무더위 건강관리 방법 :: 다가오는 여름을 대비할 수 있는 생활 ...", "contents": "당신의 모든 기록을"}, {"card": "https://m.blog.naver.com/songbiisfree/222009287005", "index": 12, "title": "더위를 피하는 간단한 방법 : 네이버 블로그", "contents": "본격적인 더위가 시"}, {"card": "http://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=a0001421128&isPc=true", "index": 13, "title": "폭염, 슬기롭게 대처합시다 - 오마이뉴스", "contents": "지구온난화가 극지방"}, {"card": "https://www.wgal.com/article/heatwave-safety-tips-signs-heat-illness/65177465", "index": 14, "title": "Tips to beat the heat and stay safe during heat waves", "contents": "Millions o"}, {"card": "https://www.betterhealth.vic.gov.au/health/healthyliving/how-to-cope-and-stay-safe-in-extreme-heat", "index": 15, "title": "How to cope and stay safe in extreme heat | Better Health Channel", "contents": "Plan ahead"}, {"card": "https://www.safetyandhealthmagazine.com/articles/25381-simple-ways-to-beat-the-heat", "index": 16, "title": "Simple ways to beat the heat | Safety+Health", "contents": "Home » Sim"}, {"card": "https://m.blog.naver.com/shhosp9804/222799449782", "index": 17, "title": "무더위 속에서 내 몸을 지키는 방법 1탄🥵 여름철 온열질환 조심하세요! : 네이버 블로그", "contents": "{\"title\":\""}, {"card": "https://m.blog.naver.com/earthwhisper/223149156976", "index": 18, "title": "[소서] 더위를 이기는 방법. 태양을 피하는 방법. 바람결, 물결이 있는 나만의 힐링장소 찾아내기! : 네이버 블로그", "contents": "{\"title\":\""}, {"card": "https://www.pima.gov/2042/Beat-the-Heat", "index": 19, "title": "Beat the Heat | Pima County, AZ", "contents": "Arizona’s "}, {"card": "https://www.nhs.uk/live-well/seasonal-health/heatwave-how-to-cope-in-hot-weather/", "index": 20, "title": "Heatwave: how to cope in hot weather - NHS", "contents": "Most of us"}], "progress_state": "answering"}}


## Text generation
Text Generation
POST /v1/chatexaone/text-generation

ChatEXAONE 하위에 End-to-End 서비스인 Chat completion, 그리고 각 기능별 특화된 모델인 Text Generation, Document Summary, Document QA, Web QA, Code QA, Data analysis까지 총 7개 API가 제공됩니다.
Text Generation API는 EXAONE 3.5 32B모델을 일반적인 대화에 초점을 맞춰 fine tuning 한 버전으로 싱글턴 및 멀티턴을 지원합니다. 사용자는 주어진 프롬프트를 이용한 텍스트 생성을 목적으로 사용하실 수 있습니다.

요청 정보
field	type	description	required
model	string	모델 정보
32b	mandatory
query	string	사용자의 질의	mandatory
previous_message	array<object>	이전 턴의 질의 및 결과	optional
previous_message[].query	string	이전 턴의 질의	optional
previous_message[].intent	string	이전 턴의 intent값	optional
previous_message[].answer	string	이전 턴의 결과	optional
temperature	number	답변의 다양성을 조절하는 파라미터
값이 높을수록 다양한 답변을 생성함
(min: 0, max: 1.0, default=0.8)	optional
응답 정보
field	type	description
result_code	number	http status code
description	string	오류 상세 설명 (result_code가 200일 경우 null)
data	object	답변 객체
data.query	string	사용자의 질의
data.intent	string	사용자의 질의에서 시스템이 파악한 의도
data.answer	string	사용자의 질의에 대해 생성된 답변
data.references	array<object>	답변 생성에 참조한 자료 (intent에 따라 없는 경우도 있음)
data.progress_state	string	모델이 답변을 생성하는 단계 (planning, optimizing, answering 등)
Intent 정보
Text Generation의 intent는 chitchat으로 고정됩니다.

intent	type	references 유무
chitchat	일반 대화	X
Single-turn Generation
아래는 간단한 싱글턴 대화에 대한 예제 코드입니다.

요청 예제
curl
python
javascript

import requests

url = "https://api.lgresearch.ai/v1/chatexaone/text-generation"
headers = {
    "Content-Type": "application/json; charset=utf-8",
    "x-api-key": "YOUR_API_KEY",
}
payload = {"query": "안녕?", "model": "32b"}

response = requests.post(url=url, json=payload, headers=headers, stream=True)
for stream in response.iter_lines():
    if stream:
        print(stream.decode("utf-8"))
                
응답 예제
json

{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "", "answer": "", "references": [{}], "progress_state": "planning"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "", "answer": "", "references": [{}], "progress_state": "optimizing"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "안녕", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "하", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "세요", "references": [{}], "progress_state": "answering"}}

...

{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "까요", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": "?", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "안녕?", "intent": "chitchat", "answer": " 😊", "references": [{}], "progress_state": "answering"}}
                
Multi-turn Conversation
여러차례 주고받은 멀티턴 대화에 대한 답변을 얻고 싶은 경우, 아래 예제 코드를 참고하십시오.

요청 예제
curl
python
javascript

curl -X 'POST' \
  'https://api.lgresearch.ai/v1/chatexaone/text-generation' \
  -H 'accept: */*' \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{
  "query": "뽀송한 여름을 보내려면?",
  "previous_messages": [
    {
      "query": "안녕?",
      "answer": "안녕하세요! 무엇을 도와드릴까요? 궁금한 점이 있으면 편하게 물어보세요. 😊",
      "intent": "chitchat"
    }
  ],
  "temperature": 0.8,
  "model": "32b"
}'
                
응답 예제
{"result_code": 200, "description": null, "data": {"query": "뽀송한 여름을 보내려면?", "intent": "", "answer": "", "references": [{}], "progress_state": "planning"}}
{"result_code": 200, "description": null, "data": {"query": "뽀송한 여름을 보내려면?", "intent": "", "answer": "", "references": [{}], "progress_state": "optimizing"}}
{"result_code": 200, "description": null, "data": {"query": "뽀송한 여름을 보내려면?", "intent": "chitchat", "answer": "뽀송", "references": [{}], "progress_state": "answering"}}
{"result_code": 200, "description": null, "data": {"query": "뽀송한 여름을 보내려면?", "intent": "chitchat", "answer": "한", "references": [{}], "progress_state": "answering"}}
