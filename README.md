# NaniteLink CMS

React, TypeScript, Vite와 AWS Amplify Gen 2로 만든 NaniteLink CMS 초기 버전입니다.

## 기능 상태

| 영역 | 상태 | 범위 |
| --- | --- | --- |
| 웹 앱 | 구현 | 한국어 기본 화면, 모바일 대응, AWS 설정 없이 열리는 로컬 안내 화면 |
| 인증 | AWS 연결 후 사용 | Cognito 이메일 로그인·로그아웃·비밀번호 재설정. 계정은 운영자가 생성 |
| 접근 권한 | AWS 연결 후 사용 | Cognito 그룹과 AppSync 데이터 권한으로 게시판 접근 및 작업 제어 |
| 게시판 | AWS 연결 후 사용 | 게시글 목록·본문 조회, 제목·본문 작성 및 수정, 관리자 삭제 |
| PWA | 구현 | 지원 브라우저에서 설치할 수 있는 매니페스트와 오프라인 안내 페이지. 로그인과 게시글 작업에는 인터넷 연결 필요 |
| 추가 기능 | 미구현 | 회원·권한 관리 화면, 다중 게시판, 댓글, 파일 첨부, 검색, 게시 승인·예약·버전 이력, 오프라인 편집·동기화, 푸시 알림 |

초기 버전에서는 아래 그룹을 사용합니다. 여러 그룹에 속한 계정에는 각 그룹의 권한이 합산됩니다. 그룹이 없는 계정에는 게시판 접근 권한이 없습니다.

| Cognito 그룹 | 조회 | 작성 | 수정 | 삭제 |
| --- | --- | --- | --- | --- |
| `Readers` | 가능 | — | — | — |
| `Editors` | 가능 | 가능 | 가능 | — |
| `Admins` | 가능 | 가능 | 가능 | 가능 |

## 로컬 실행 및 빌드

Node.js 22 LTS(22.12 이상) 또는 24 LTS와 npm이 필요합니다. Amplify의 묶음 의존성에서 발생하는 잠금 파일 검증 문제 때문에 설치에는 아래 명령을 사용합니다. [npm 이슈 #9821](https://github.com/npm/cli/issues/9821)

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run build`는 프런트엔드와 Amplify 리소스의 타입을 검사하고 `dist/`에 웹 앱을 빌드합니다. `amplify_outputs.json`이 없는 빌드에는 로컬 안내 화면이 표시됩니다.

## AWS 연결

1. 개발용 AWS 프로필을 구성하고 필요한 Amplify·CDK 권한을 준비합니다.
2. 프로젝트 루트에서 `npx ampx sandbox`를 실행합니다. 백엔드 배포가 완료되면 프로젝트 루트에 `amplify_outputs.json`이 생성됩니다.
3. 생성된 Cognito 사용자 풀에서 테스트 사용자를 만들고 `Admins`, `Editors`, `Readers` 중 필요한 그룹에 추가합니다. 그룹을 변경한 뒤에는 다시 로그인하여 새 토큰을 받습니다.
4. 개발 서버를 시작하거나 다시 시작합니다. 프로덕션 미리보기는 설정 파일 생성 후 다시 빌드합니다.
5. 그룹별 계정으로 로그인해 허용된 작업과 거부되어야 할 작업을 확인합니다.

Amplify Hosting에 저장소를 연결하면 `amplify.yml`이 Gen 2 백엔드를 배포한 뒤 프런트엔드를 빌드합니다. AWS 리소스 배포 및 실계정 통합 테스트는 초기 GitHub 업로드 범위에서 제외했습니다. AWS 자격 증명, 환경 파일 및 생성된 연결 설정은 저장소 밖에서 관리합니다.

[Amplify Gen 2 개발 환경 안내](https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/setup/)
