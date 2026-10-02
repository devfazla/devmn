# Generates cohesive project cover art for the portfolio (no external image
# credits available, so covers are produced locally with GDI+). Output:
#   react-app/src/assets/proj-health.jpg   1200x750
#   react-app/src/assets/proj-super.jpg    1200x750
#   react-app/src/assets/proj-sports.jpg   1200x750
# Cool-toned abstract covers that share one visual family (deep ink -> accent,
# soft corner glow, faint grid, large monogram, small uppercase label).
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'react-app\src\assets'
New-Item -ItemType Directory -Force $outDir | Out-Null

function New-Canvas([int]$w, [int]$h) {
    $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    return @{ Bmp = $bmp; G = $g }
}

function Save-Jpg($bmp, $path, [int]$quality) {
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
    $params = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $params.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    $bmp.Save($path, $codec, $params)
    Write-Host "wrote $path"
}

function Fill-Glow($g, [int]$cx, [int]$cy, [int]$r, $rgb, [int]$alpha) {
    $steps = 150
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

$covers = @(
    @{ File = 'proj-health.jpg'; From = @(6, 32, 30);  To = @(13, 148, 136); Glow = @(20, 184, 166); Mono = 'AI'; Label = 'AI HEALTH DOCTOR' },
    @{ File = 'proj-super.jpg';  From = @(8, 26, 38);  To = @(14, 116, 144); Glow = @(56, 189, 248); Mono = 'PS'; Label = 'PROJECT SUPER' },
    @{ File = 'proj-sports.jpg'; From = @(7, 30, 24);  To = @(5, 150, 105);  Glow = @(74, 222, 128); Mono = 'NS'; Label = 'NEXGEN SPORTS' }
)

$W = 1200
$H = 750

foreach ($cov in $covers) {
    $c = New-Canvas $W $H
    $g = $c.G

    # Diagonal base gradient (deep ink -> brand accent family)
    $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($W, $H),
        [System.Drawing.Color]::FromArgb(255, $cov.From[0], $cov.From[1], $cov.From[2]),
        [System.Drawing.Color]::FromArgb(255, $cov.To[0], $cov.To[1], $cov.To[2]))
    $g.FillRectangle($bg, 0, 0, $W, $H)
    $bg.Dispose()

    # Soft corner glow, top-right
    Fill-Glow $g ($W - 150) 120 520 $cov.Glow 235

    # Faint grid texture
    $gridPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(12, 255, 255, 255), 1.0)
    for ($x = 0; $x -le $W; $x += 64) { $g.DrawLine($gridPen, $x, 0, $x, $H) }
    for ($y = 0; $y -le $H; $y += 64) { $g.DrawLine($gridPen, 0, $y, $W, $y) }
    $gridPen.Dispose()

    # Thin accent rule near the bottom-left
    $ruleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, $cov.Glow[0], $cov.Glow[1], $cov.Glow[2]))
    $g.FillRectangle($ruleBrush, 84, 636, 150, 6)
    $ruleBrush.Dispose()

    $fmt = [System.Drawing.StringFormat]::new()
    $fmt.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap

    # Large translucent monogram
    $monoFont = [System.Drawing.Font]::new('Segoe UI', 240.0, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $monoBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
    $null = $g.DrawString($cov.Mono, $monoFont, $monoBrush, [System.Drawing.PointF]::new(70.0, 300.0), $fmt)

    # Small uppercase label
    $labelFont = [System.Drawing.Font]::new('Segoe UI', 30.0, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $labelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(240, 255, 255, 255))
    $null = $g.DrawString($cov.Label, $labelFont, $labelBrush, [System.Drawing.PointF]::new(84.0, 664.0), $fmt)

    Save-Jpg $c.Bmp (Join-Path $outDir $cov.File) 84
    foreach ($d in @($monoFont, $monoBrush, $labelFont, $labelBrush, $fmt)) { $d.Dispose() }
    $g.Dispose(); $c.Bmp.Dispose()
}
