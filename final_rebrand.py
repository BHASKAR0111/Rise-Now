import os
import re

def rename_content(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Case-sensitive replacements
    new_content = content.replace("Risel", "Risel")
    new_content = new_content.replace("risel", "risel")
    new_content = new_content.replace("RISEL", "RISEL")
    
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated content in: {file_path}")

def rename_files(root_dir):
    for root, dirs, files in os.walk(root_dir):
        if '.git' in root:
            continue
            
        # First update content in all files
        for file in files:
            if file.endswith(('.html', '.js', '.css', '.py', '.md')):
                rename_content(os.path.join(root, file))
        
        # Then rename files themselves
        for file in files:
            if "risel" in file.lower():
                new_name = file.replace("risel", "risel").replace("Risel", "Risel")
                os.rename(os.path.join(root, file), os.path.join(root, new_name))
                print(f"Renamed file: {file} -> {new_name}")

if __name__ == "__main__":
    target_dir = os.getcwd()
    print(f"Final Rebranding to Risel starting in: {target_dir}")
    rename_files(target_dir)
    print("Branding is now 100% Risel!")
