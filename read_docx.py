import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            
        tree = ET.fromstring(xml_content)
        
        # XML namespace for Word
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        # Extract all text nodes
        paragraphs = []
        for p in tree.findall('.//w:p', namespace):
            texts = [node.text for node in p.findall('.//w:t', namespace) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {e}"

if __name__ == "__main__":
    text = extract_text_from_docx('summit 1 u5.docx')
    with open('extracted_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Done extracting. Check extracted_text.txt.")
