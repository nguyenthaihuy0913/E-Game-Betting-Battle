import json
import re

def parse_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        # keep non-empty lines
        lines = [line.strip() for line in f if line.strip()]

    # 1. Parse answers
    try:
        mcq_ans_idx = lines.index("Part 1: Multiple Choice")
        gf_ans_idx = lines.index("Part 2: Gap-Fill")
        
        # MCQ answers
        mcq_answers = {}
        # From mcq_ans_idx + 2 to gf_ans_idx (skipping 'Q A Q A...')
        i = mcq_ans_idx + 12
        while i < gf_ans_idx:
            if lines[i].isdigit() and i+1 < gf_ans_idx:
                q_num = int(lines[i])
                ans = lines[i+1]
                mcq_answers[q_num] = ans
                i += 2
            else:
                i += 1
                
        # Gap fill answers
        gf_answers = lines[gf_ans_idx+1:]
    except ValueError:
        print("Could not find answer sections.")
        return

    # 2. Parse questions
    # Multiple Choice
    multiple_choice = []
    # Find start of MCQ
    mcq_start = 0
    for i, line in enumerate(lines):
        if re.search(r"1\.\s*I don't mind", line):
            mcq_start = i
            break
            
    # Gap Fill Start
    gf_start = 0
    for i, line in enumerate(lines):
        if re.search(r"1\.\s*Living in a bustling city", line):
            gf_start = i
            break

    # Extract MCQ
    mcq_lines = lines[mcq_start:lines.index("PART 2: GAP-FILL EXERCISES (20 câu)")]
    
    current_q = None
    options = []
    opt_map = {}
    q_num = 0
    
    for line in mcq_lines:
        match = re.match(r'^(\d+)\.\s*(.*)', line)
        if match:
            if current_q:
                ans_letter = mcq_answers.get(q_num, 'A')
                ans_text = opt_map.get(ans_letter, '')
                multiple_choice.append({
                    "id": q_num,
                    "question": current_q,
                    "options": options,
                    "correct_answer": ans_letter,
                    "correct_answer_text": ans_text
                })
            q_num = int(match.group(1))
            current_q = match.group(2)
            options = []
            opt_map = {}
        else:
            opt_match = re.match(r'^([A-D])\.\s*(.*)', line)
            if opt_match:
                letter = opt_match.group(1)
                text = opt_match.group(2)
                full_opt = f"{letter}. {text}"
                options.append(full_opt)
                opt_map[letter] = full_opt

    if current_q:
        ans_letter = mcq_answers.get(q_num, 'A')
        ans_text = opt_map.get(ans_letter, '')
        multiple_choice.append({
            "id": q_num,
            "question": current_q,
            "options": options,
            "correct_answer": ans_letter,
            "correct_answer_text": ans_text
        })

    # Extract Gap Fill
    gap_fill = []
    gf_lines = lines[gf_start:lines.index("PART 3: TABLE SUMMARY (Vocabulary & Grammar Points Used)")]
    
    for line in gf_lines:
        match = re.match(r'^(\d+)\.\s*(.*)', line)
        if match:
            num = int(match.group(1))
            q_text = match.group(2)
            ans = gf_answers[num-1] if num-1 < len(gf_answers) else ""
            gap_fill.append({
                "id": num,
                "question": q_text,
                "correct_answer": ans
            })

    # Limit to 25 and 25 (Actually user said 25 and 25, document has 30 and 20. We keep all.)
    
    output = {
        "multiple_choice": multiple_choice,
        "gap_fill": gap_fill
    }

    import os
    os.makedirs('frontend/src/data', exist_ok=True)
    with open('frontend/src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Parsed questions successfully: frontend/src/data/questions.json")

if __name__ == "__main__":
    parse_file('extracted_text.txt')
