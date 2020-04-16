<script>
    import { Capacitor, Plugins } from '@capacitor/core';
    import { createEventDispatcher, onMount } from 'svelte';
    import QrScanner from 'qr-scanner';

    QrScanner.WORKER_PATH = '/scanner.worker.min.js';

    const dispatch = createEventDispatcher();

    let video;
    let scanner;
    let camera;
    let cameraError = false;

    const scannerMobile = async (init) => {
        if (typeof init === 'boolean') {
            try {
                const { CameraPreview } = Plugins;
                camera = CameraPreview;
                await camera.start({ position: 'rear' });
            } catch (err) {
                cameraError = true;
            }
        }
        try {
            if (camera) {
                const capture = await camera.capture();
                const img = new Image();
                img.src = `data:image/jpeg;base64,${capture.value}`;
                const data = await QrScanner.scanImage(img);
                if (data) {
                    dispatch('message', data);

                    camera.stop();
                    camera = null;
                } else {
                    requestAnimationFrame(initateScanner);
                }
            }
        } catch (err) {
            requestAnimationFrame(initateScanner);
        }
    };

    const scannerWeb = async (stream) => {
        try {
            navigator.getUserMedia =
                navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (!navigator.mediaDevices.getUserMedia && !navigator.getUserMedia) {
                cameraError = true;
            } else {
                scanner = new QrScanner(video, (data) => {
                    dispatch('message', data);
                    scanner.destroy();
                    scanner = null;
                });
                await scanner.start();
            }
        } catch (err) {
            cameraError = true;
        }
    };

    onMount(() => {
        if (Capacitor.getPlatform() === 'web') {
            scannerWeb();
        } else {
            scannerMobile(true);
        }

        return () => {
            if (camera) {
                camera.stop();
                camera = null;
            }
            if (scanner) {
                scanner.destroy();
                scanner = null;
            }
        };

        return () => {
            if (camera) {
                camera.stop();
                camera = null;
            }
            if (scanner) {
                scanner.destroy();
                scanner = null;
            }
        };
    });
</script>

<style>
    main {
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    scanner {
        flex: 1;
        position: relative;
        background: #000;
        overflow: hidden;
        opacity: 0;
    }
    scanner.enabled {
        opacity: 1;
    }
    .video-container {
        position: absolute;
        top: 0px;
        left: 50%;
        height: 100%;
        width: auto;
        transform: translate(-50%, 0);
    }
    video {
        display: block;
        height: 100%;
    }
</style>

<main>
    <scanner class:enabled="{scanner}">
        <div class="video-container">
            <video bind:this="{video}" autoplay playsinline></video>
        </div>
        <svg width="900" height="550" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M167 10V0h26.976c5.523 0 10 4.477 10 10v27h-10V10H167zM36.976 10H10v27H0V10C0 4.477 4.477 0 10 0h26.976v10zM167
                194h26.976v-27h10v27c0 5.523-4.477 10-10 10H167v-10zm-130.024 0v10H10c-5.523 0-10-4.477-10-10v-27h10v27h26.976z"
            ></path>
        </svg>
    </scanner>
</main>
