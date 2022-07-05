import os

def generate(head: str = './video/'):
    '''
    example: 
        head = './video/'
        head = 'http://localhost:8000/'
    '''
    with open('./input/video.txt', mode='w', encoding='utf-8') as f:
        f.write('URLID,URL\n')
        for index, item in enumerate(os.listdir('./video')):
            f.write(f"{index},{head+item}\n")
        f.close()

if __name__ == '__main__':
    generate()