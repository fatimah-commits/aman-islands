# Records every line in voice/lines.json with Microsoft Edge neural voices
# and writes voice/manifest.json (spoken text -> mp3 file) for the game.
import asyncio, json, os
import edge_tts

async def main():
    lines = json.load(open('voice/lines.json', encoding='utf-8'))
    for ln in lines:
        path = os.path.join('voice', ln['file'])
        if os.path.exists(path):
            continue
        for attempt in range(4):
            try:
                await edge_tts.Communicate(ln['key'], ln['voice'], rate='-8%').save(path)
                break
            except Exception as e:
                print('retry', ln['file'], e)
                await asyncio.sleep(2 ** attempt)
        print('made', ln['file'], ln['key'])
    keep = {ln['file'] for ln in lines}
    for f in os.listdir('voice'):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join('voice', f))
    manifest = {ln['key']: ln['file'] for ln in lines if os.path.exists(os.path.join('voice', ln['file']))}
    json.dump(manifest, open('voice/manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

asyncio.run(main())
