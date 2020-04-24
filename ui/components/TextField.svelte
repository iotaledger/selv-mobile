<script>
    export let value;
    export let placeholder;
    export let disabled;
</script>

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>

<input {disabled} type="text" {placeholder} bind:value />
