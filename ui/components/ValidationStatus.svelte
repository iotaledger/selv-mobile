<script>
    export let valid: boolean;
    export let loading: boolean = true;
</script>

<style>
    .circle-loader {
        --brand-success: #5cb85c;
        --brand-error: #dd0000;
        --loader-size: 7em;
        --check-height: calc(var(--loader-size) / 2);
        --check-width: calc(var(--check-height) / 2);
        --check-left: calc(calc(var(--loader-size) / 6) + calc(var(--loader-size) / 12));
        --check-thickness: 3px;
        --check-color: var(--brand-success);
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-left-color: var(--check-color);
        animation: loader-spin 1.2s infinite linear;
        position: relative;
        display: inline-block;
        vertical-align: top;
        border-radius: 50%;
        width: var(--loader-size);
        height: var(--loader-size);
    }

    .circle-loader.invalid {
        border-color: var(--brand-error);
    }

    .load-complete {
        -webkit-animation: none;
        animation: none;
        border-color: var(--check-color);
        transition: border 500ms ease-out;
    }

    .checkmark {
        display: none;
    }

    .checkmark::after {
        opacity: 1;
        height: var(--check-height);
        width: var(--check-width);
        transform-origin: left top;
        border-right: var(--check-thickness) solid var(--check-color);
        border-top: var(--check-thickness) solid var(--check-color);
        content: '';
        left: var(--check-left);
        top: var(--check-height);
        position: absolute;
    }

    .checkmark.draw {
        display: block;
    }

    .checkmark.draw::after {
        animation-duration: 800ms;
        animation-timing-function: ease;
        animation-name: checkmark;
        transform: scaleX(-1) rotate(135deg);
    }

    @keyframes loader-spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes checkmark {
        0% {
            height: 0;
            width: 0;
            opacity: 1;
        }
        20% {
            height: 0;
            width: var(--check-width);
            opacity: 1;
        }
        40% {
            height: var(--check-height);
            width: var(--check-width);
            opacity: 1;
        }
        100% {
            height: var(--check-height);
            width: var(--check-width);
            opacity: 1;
        }
    }
</style>

<div class="circle-loader" class:load-complete="{!loading}" class:invalid="{valid !== undefined && !valid}">
    <div class="checkmark" class:draw="{valid}"></div>
</div>
