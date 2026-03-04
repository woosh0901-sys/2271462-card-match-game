#!/bin/bash

# GitHub 이슈 생성 스크립트
# Plan.md의 23개 티켓을 GitHub 이슈로 자동 생성

PLAN_FILE="Plan.md"
REPO="golsung/card-match-game"
LOG_FILE="issue_creation.log"

# 로그 파일 초기화
> "$LOG_FILE"

echo "========================================="
echo "📋 GitHub 이슈 생성 스크립트"
echo "========================================="
echo "리포지토리: $REPO"
echo "소스 파일: $PLAN_FILE"
echo ""

# 리포지토리 접근 확인
echo "Step 1: 리포지토리 접근 확인..."
if ! gh repo view "$REPO" > /dev/null 2>&1; then
  echo "❌ 리포지토리에 접근할 수 없습니다: $REPO"
  echo "리포지토리가 존재하고 권한이 있는지 확인하세요."
  exit 1
fi
echo "✅ 리포지토리 접근 확인 완료"
echo ""

# Phase 매핑 함수
get_phase() {
  local num=$1
  if [ "$num" -le 3 ]; then echo 1
  elif [ "$num" -le 6 ]; then echo 2
  elif [ "$num" -le 11 ]; then echo 3
  elif [ "$num" -le 13 ]; then echo 4
  elif [ "$num" -le 18 ]; then echo 5
  elif [ "$num" -le 21 ]; then echo 6
  else echo 7
  fi
}

# 라벨 매핑 함수
get_labels() {
  local num=$1
  case $num in
    1) echo "setup,frontend" ;;
    2) echo "setup,backend" ;;
    3) echo "setup,frontend,backend" ;;
    4|5|6) echo "backend" ;;
    7|8|9|10|11) echo "frontend,ui/ux" ;;
    12|13) echo "core-logic,state-management" ;;
    14|15|16|17|18) echo "core-logic,state-management" ;;
    19|20|21) echo "frontend,ui/ux" ;;
    22|23) echo "frontend,ui/ux" ;;
  esac
}

# 티켓 정보 추출 함수
extract_ticket_info() {
  local ticket_num=$1
  local temp_file="/tmp/ticket_${ticket_num}.txt"

  # 티켓 섹션 추출 (### 티켓 #N부터 다음 ---까지)
  awk -v num="$ticket_num" '
    /^### 티켓 #/ {
      if ($3 == "#" num) {
        found=1
      } else if (found) {
        exit
      }
    }
    found && /^---$/ {
      if (NR > start + 5) {
        exit
      }
    }
    found {
      if (NR > 1 && prev ~ /^---$/ && $0 ~ /^$/) {
        exit
      }
      print
      prev = $0
    }
  ' "$PLAN_FILE" > "$temp_file"

  # 제목 추출
  local title=$(grep "^\*\*제목:\*\*" "$temp_file" | sed 's/^\*\*제목:\*\* //')

  # 상세 요구사항 추출
  local description=$(awk '
    /^\*\*상세 요구사항:\*\*/ { found=1; next }
    /^\*\*수용 기준/ { found=0 }
    found && NF > 0 { print }
  ' "$temp_file")

  # AC 추출
  local ac=$(awk '
    /^\*\*수용 기준/ { found=1; next }
    /^\*\*Why/ { found=0 }
    found && /^- \[ \]/ { print }
  ' "$temp_file")

  # Why 추출
  local why=$(awk '
    /^\*\*Why\(소프트웨어 공학적 근거\):\*\*/ { found=1; next }
    /^---$/ { found=0 }
    found && NF > 0 { print }
  ' "$temp_file")

  local phase=$(get_phase "$ticket_num")

  # Issue body 조합
  cat <<EOF
## 📝 Description

### 상세 요구사항
$description

### 소프트웨어 공학적 근거 (Why)
$why

## ✅ Acceptance Criteria
$ac

## 🔗 Reference
- **Part of**: Phase $phase
- **Principles**: INVEST Compliant
- **Source**: Plan.md 티켓 #$ticket_num

---
🤖 Generated with Claude Code
EOF

  # 임시 파일 삭제
  rm -f "$temp_file"
}

# 티켓 생성 카운터
success_count=0
fail_count=0

echo "Step 2: 이슈 생성 시작..."
echo ""

# 23개 티켓 생성
for ticket_num in {1..23}; do
  phase=$(get_phase "$ticket_num")
  labels=$(get_labels "$ticket_num")

  # 티켓 정보 추출
  title=$(awk -v num="$ticket_num" '
    /^### 티켓 #/ && $3 == "#" num { found=1 }
    found && /^\*\*제목:\*\*/ {
      sub(/^\*\*제목:\*\* /, "")
      print
      exit
    }
  ' "$PLAN_FILE" | tr -d '\n')

  body=$(extract_ticket_info "$ticket_num")

  echo "생성 중: 티켓 #$ticket_num - [Phase $phase] $title"

  # 이슈 생성
  if gh issue create \
    --repo "$REPO" \
    --title "[Phase $phase] $title" \
    --body "$body" \
    --label "$labels" >> "$LOG_FILE" 2>&1; then

    echo "✅ 생성 완료: 티켓 #$ticket_num"
    ((success_count++))
  else
    echo "❌ 생성 실패: 티켓 #$ticket_num" | tee -a "$LOG_FILE"
    ((fail_count++))
  fi

  echo ""

  # Rate limiting 방지 (1초 대기)
  sleep 1
done

echo ""
echo "========================================="
echo "📊 이슈 생성 완료 보고"
echo "========================================="
echo "성공: $success_count개"
echo "실패: $fail_count개"
echo ""

# 생성된 이슈 목록 확인
echo "Step 3: 생성된 이슈 확인..."
echo ""
gh issue list --repo "$REPO" --limit 30 --state open

echo ""
echo "========================================="
echo "✅ 스크립트 실행 완료"
echo "========================================="
echo "상세 로그: $LOG_FILE"
echo ""

# Phase별 요약
echo "📊 Phase별 요약:"
for phase in {1..7}; do
  count=$(gh issue list --repo "$REPO" --search "in:title \"[Phase $phase]\"" --state open --limit 100 2>/dev/null | wc -l | tr -d ' ')
  echo "  Phase $phase: $count개"
done

echo ""
echo "🎉 모든 작업이 완료되었습니다!"
