import os

# Filter out huge files, videos, and the output file itself
extensions = ('.html', '.js', '.py', '.sql', '.css')
output_file = 'CyberShield_Clean_Source.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # Skip node_modules or git folders if any
        if '.git' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith(extensions) and file != output_file and file != 'merge.py':
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as infile:
                        content = infile.read()
                        outfile.write(f"\n\n{'='*30}\n=== FILE: {file} ===\n{'='*30}\n\n")
                        outfile.write(content)
                except Exception as e:
                    print(f"Skipped {file}: {e}")

print("Done! CyberShield_Clean_Source.txt has been generated successfully without high RAM usage.")