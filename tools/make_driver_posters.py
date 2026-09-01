#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
给每个出租车司机生成专属二维码海报。

机制：
  - 每张海报的二维码指向 https://AFeiNice.github.io/pedestrianism/?src=<司机名>[&phone=<手机号>]
  - 扫码报名后，报名邮件会自动带上「推荐人 = 司机名」「推荐人电话 = 手机号」
  - 你看到邮件里的「推荐人：张师傅」就知道是谁拉来的报名

用法：
  python3 make_driver_posters.py "张师傅" "李师傅,13800000000" "王师傅"
    带手机号用「姓名,手机号」格式；不带则只打印姓名。
  也可改下面的 DRIVERS 列表后直接运行。

输出：~/Desktop/driver-posters/ 下的 PNG 海报，文件名为「司机名-海报.png」。
"""
import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.expanduser('~/Desktop/1-报名二维码-v2.png')
SITE = 'https://AFeiNice.github.io/pedestrianism/'
OUT_DIR = os.path.expanduser('~/Desktop/driver-posters/')

# 底图上原有二维码的区域（x0,y0,x1,y1）与白色子卡范围
QR_BOX = (451, 1008, 726, 1283)
CARD_X0, CARD_X1 = 430, 748
# 二维码下方白色留白（写司机姓名用）
LABEL_Y0, LABEL_Y1 = 1285, 1307

if not os.path.exists(BASE):
    print('未找到底图：' + BASE)
    print('请确认桌面存在海报模板 1-报名二维码-v2.png（移走或删掉了会报这个错）')
    raise SystemExit(1)

DRIVERS = []  # 优先用命令行参数；留空则用此列表

FONTS = [
    '/System/Library/Fonts/Hiragino Sans GB.ttc',
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/STHeiti Medium.ttc',
]


def load_font(size):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_poster(name, phone='', out=None):
    img = Image.open(BASE).convert('RGB')
    draw = ImageDraw.Draw(img)

    # 1. 司机专属二维码（覆盖原二维码位置）
    url = SITE + '?src=' + name + ('&phone=' + phone if phone else '')
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
    qr_w = QR_BOX[2] - QR_BOX[0]
    qr_img = qr_img.resize((qr_w, qr_w), Image.LANCZOS)
    img.paste(qr_img, (QR_BOX[0], QR_BOX[1]))

    # 2. 白色子卡底部居中写「司机姓名（手机号）」，与二维码对齐不压标题
    label = name + (' · ' + phone if phone else '')
    font = load_font(16)
    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    cx = (CARD_X0 + CARD_X1) / 2
    tx = cx - tw / 2 - bbox[0]
    ty = (LABEL_Y0 + LABEL_Y1) / 2 - th / 2 - bbox[1]
    draw.text((tx, ty), label, font=font, fill=(29, 29, 31))

    if out is None:
        out = os.path.join(OUT_DIR, name + '-海报.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out)
    return out, url


if __name__ == '__main__':
    args = DRIVERS
    import sys
    if len(sys.argv) > 1:
        args = sys.argv[1:]
    if not args:
        print('用法：python3 make_driver_posters.py "张师傅" "李师傅,13800000000"')
        raise SystemExit(1)
    for a in args:
        parts = [p.strip() for p in a.split(',')]
        name = parts[0]
        phone = parts[1] if len(parts) > 1 else ''
        out, url = make_poster(name, phone)
        print('已生成:', out)
        print('  二维码 ->', url)
