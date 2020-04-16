<script>
    export let value;
    export let placeholder;
</script>

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>

<input type="text" {placeholder} bind:value />
