# Builds brand assets from images/profile.png:
#  - public/og-image.png          1200x630  (Open Graph / Twitter share card)
#  - public/favicon.png            32x32
#  - public/apple-touch-icon.png  180x180
#  - public/icon-192.png          192x192  (web manifest)
#  - public/icon-512.png          512x512  (web manifest)
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'react-app\public'
New-Item -ItemType Directory -Force $public | Out-Null
$profile = [System.Drawing.Image]::FromFile((Join-Path $root 'images\profile.png'))

function New-Canvas([int]$w, [int]$h) {
    $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    return @{ Bmp = $bmp; G = $g }
}

function Save-Png($bmp, $name) {
    $path = Join-Path $script:public $name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "wrote $path"
}

function Fill-Glow($g, [int]$cx, [int]$cy, [int]$r, $rgb, [int]$alpha) {
    # Radial glow faked with stacked concentric ellipses (alpha falloff), which
    # avoids PathGradientBrush members missing from the PowerShell System.Drawing shim.
    $steps = 160
    for ($i = $steps; $i -ge 1; $i--) {
        $t = $i / $steps
        $rr = [int]($r * $t)
        $a = [int]($alpha * [Math]::Pow(1 - $t, 2.6) / ($steps * 0.05))
        if ($a -lt 1) { continue }
        if ($a -gt 255) { $a = 255 }
        $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($a, $rgb[0], $rgb[1], $rgb[2]))
        $g.FillEllipse($brush, $cx - $rr, $cy - $rr, $rr * 2, $rr * 2)
        $brush.Dispose()
    }
}

function Scale-Square([int]$size, $name) {
    $c = New-Canvas $size $size
    $dest = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
    $null = $c.G.DrawImage($script:profile, $dest, 0, 0, $script:profile.Width, $script:profile.Height, [System.Drawing.GraphicsUnit]::Pixel)
    Save-Png $c.Bmp $name
    $c.G.Dispose(); $c.Bmp.Dispose()
}

function Scale-To([int]$size, [string]$outPath, [int]$quality) {
    # Renders the square source at $size and encodes JPEG with an explicit quality
    # (GDI+ defaults to ~75 which is visibly blocky on faces).
    $bmp = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $gg = [System.Drawing.Graphics]::FromImage($bmp)
    $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gg.Clear([System.Drawing.Color]::White)
    $dest = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
    $null = $gg.DrawImage($script:profile, $dest, 0, 0, $script:profile.Width, $script:profile.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
    $params = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $params.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    New-Item -ItemType Directory -Force (Split-Path -Parent $outPath) | Out-Null
    $bmp.Save($outPath, $codec, $params)
    Write-Host "wrote $outPath"
    $gg.Dispose(); $bmp.Dispose()
}

# ---------- Open Graph banner (1200x630) ----------
$W = 1200
$H = 630
$c = New-Canvas $W $H
$g = $c.G

# Base diagonal gradient: deep navy -> indigo/violet
$bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($W, $H),
    [System.Drawing.Color]::FromArgb(255, 11, 17, 43),
    [System.Drawing.Color]::FromArgb(255, 49, 32, 105))
$g.FillRectangle($bg, 0, 0, $W, $H)
$bg.Dispose()

# Soft accent glows (indigo / cyan / violet)
Fill-Glow $g 1080 90 340 @(99, 102, 241) 255
Fill-Glow $g 140 610 320 @(6, 182, 212) 235
Fill-Glow $g 760 650 280 @(139, 92, 246) 235

# Faint grid
$gridPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(14, 255, 255, 255), 1.0)
for ($x = 0; $x -le $W; $x += 60) { $g.DrawLine($gridPen, $x, 0, $x, $H) }
for ($y = 0; $y -le $H; $y += 60) { $g.DrawLine($gridPen, 0, $y, $W, $y) }
$gridPen.Dispose()

# Gradient accent bar under the name
$accentRect = [System.Drawing.Rectangle]::new(84, 372, 420, 10)
$accent = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $accentRect,
    [System.Drawing.Color]::FromArgb(255, 99, 102, 241),
    [System.Drawing.Color]::FromArgb(255, 6, 182, 212),
    [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillRectangle($accent, 84, 372, 420, 10)
$accent.Dispose()

$nameFont = [System.Drawing.Font]::new('Segoe UI', 82.0, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$labelFont = [System.Drawing.Font]::new('Segoe UI', 27.0, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subFont = [System.Drawing.Font]::new('Segoe UI', 25.0, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

$fmt = [System.Drawing.StringFormat]::new()
$fmt.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap

$nameBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255))
$labelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(235, 129, 140, 248))
$subBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(225, 203, 213, 225))

$null = $g.DrawString('FAZLA RABBI', $nameFont, $nameBrush, [System.Drawing.PointF]::new(80.0, 244.0), $fmt)
$null = $g.DrawString('S O F T W A R E   D E V E L O P E R', $labelFont, $labelBrush, [System.Drawing.PointF]::new(88.0, 410.0), $fmt)
$null = $g.DrawString('Android  |  Flutter  |  Web  |  UI/UX', $subFont, $subBrush, [System.Drawing.PointF]::new(88.0, 460.0), $fmt)

# Circular profile photo with a gradient ring, right side
$dia = 300
$cx = 830
$cy = [int](($H - $dia) / 2)
$ringRect = [System.Drawing.Rectangle]::new($cx - 12, $cy - 12, $dia + 24, $dia + 24)
$ring = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $ringRect,
    [System.Drawing.Color]::FromArgb(255, 99, 102, 241),
    [System.Drawing.Color]::FromArgb(255, 6, 182, 212),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
$g.FillEllipse($ring, $cx - 12, $cy - 12, $dia + 24, $dia + 24)
$ring.Dispose()

$clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
$null = $clip.AddEllipse($cx, $cy, $dia, $dia)
$oldClip = $g.Clip
$g.SetClip($clip)
$photoRect = [System.Drawing.Rectangle]::new($cx, $cy, $dia, $dia)
$null = $g.DrawImage($profile, $photoRect, 0, 0, $profile.Width, $profile.Height, [System.Drawing.GraphicsUnit]::Pixel)
$g.Clip = $oldClip
$clip.Dispose()

Save-Png $c.Bmp 'og-image.png'
foreach ($d in @($nameFont, $labelFont, $subFont, $nameBrush, $labelBrush, $subBrush, $fmt)) { $d.Dispose() }
$g.Dispose(); $c.Bmp.Dispose()

# ---------- Icon set ----------
Scale-Square 32 'favicon.png'
Scale-Square 180 'apple-touch-icon.png'
Scale-Square 192 'icon-192.png'
Scale-Square 512 'icon-512.png'

# Stable, crawlable URL referenced by the JSON-LD Person image and sitemap.xml
New-Item -ItemType Directory -Force (Join-Path $public 'images') | Out-Null
Copy-Item (Join-Path $root 'images\profile.png') (Join-Path $public 'images\profile.png') -Force
Write-Host "wrote $(Join-Path $public 'images\profile.png')"

# Right-sized hero/portrait asset for the bundle: the 1024px PNG weighed ~97 KB
# but only ever renders at 300px, so ship a 600px JPEG (2x for retina) instead.
Scale-To 600 (Join-Path $root 'react-app\src\assets\profile.jpg') 82

$profile.Dispose()
Write-Host 'Brand assets generated.' -ForegroundColor Green
