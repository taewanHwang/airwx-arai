#!/bin/bash

# ARAI 베타 테스터용 다중 컨테이너 배포 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 이미지 이름
IMAGE_NAME="arai-app"

# 함수: 도움말 표시
show_help() {
    echo "사용법: ./deploy-beta.sh [옵션]"
    echo ""
    echo "옵션:"
    echo "  start [n]    n개의 베타 컨테이너 시작 (기본값: 10)"
    echo "  stop         모든 베타 컨테이너 중지"
    echo "  restart      모든 베타 컨테이너 재시작"
    echo "  status       모든 베타 컨테이너 상태 확인"
    echo "  clean        모든 베타 컨테이너 제거"
    echo "  build        Docker 이미지 빌드"
    echo "  help         이 도움말 표시"
}

# 함수: Docker 이미지 빌드
build_image() {
    echo -e "${YELLOW}Docker 이미지 빌드 중...${NC}"
    docker build -t ${IMAGE_NAME} .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}이미지 빌드 완료!${NC}"
    else
        echo -e "${RED}이미지 빌드 실패${NC}"
        exit 1
    fi
}

# 함수: 컨테이너 시작
start_containers() {
    local count=${1:-10}
    echo -e "${YELLOW}${count}개의 베타 컨테이너 시작 중...${NC}"
    
    for i in $(seq 1 ${count}); do
        port=$((3000 + i))
        container_name="arai-beta${i}"
        
        # 기존 컨테이너가 있으면 제거
        docker rm -f ${container_name} 2>/dev/null
        
        # 새 컨테이너 시작
        docker run -d -p ${port}:3000 --name ${container_name} --restart unless-stopped ${IMAGE_NAME}
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} 베타 테스터 ${i} 컨테이너 시작 (포트: ${port})"
        else
            echo -e "${RED}✗${NC} 베타 테스터 ${i} 컨테이너 시작 실패"
        fi
    done
}

# 함수: 컨테이너 중지
stop_containers() {
    echo -e "${YELLOW}모든 베타 컨테이너 중지 중...${NC}"
    docker stop $(docker ps -q --filter "name=arai-beta") 2>/dev/null
    echo -e "${GREEN}완료${NC}"
}

# 함수: 컨테이너 재시작
restart_containers() {
    stop_containers
    start_containers
}

# 함수: 컨테이너 상태 확인
check_status() {
    echo -e "${YELLOW}베타 컨테이너 상태:${NC}"
    echo "-----------------------------------"
    
    for i in {1..10}; do
        container_name="arai-beta${i}"
        port=$((3000 + i))
        
        if docker ps --format "table {{.Names}}" | grep -q ${container_name}; then
            echo -e "${GREEN}✓${NC} ${container_name}: 실행 중 (포트: ${port})"
        else
            if docker ps -a --format "table {{.Names}}" | grep -q ${container_name}; then
                echo -e "${RED}✗${NC} ${container_name}: 중지됨"
            else
                echo -e "${YELLOW}-${NC} ${container_name}: 없음"
            fi
        fi
    done
}

# 함수: 컨테이너 정리
clean_containers() {
    echo -e "${YELLOW}모든 베타 컨테이너 제거 중...${NC}"
    docker rm -f $(docker ps -aq --filter "name=arai-beta") 2>/dev/null
    echo -e "${GREEN}완료${NC}"
}

# 메인 스크립트
case "$1" in
    start)
        build_image
        start_containers $2
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    status)
        check_status
        ;;
    clean)
        clean_containers
        ;;
    build)
        build_image
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        ;;
esac