<script>
    import ObjectList from '~/components/ObjectList.svelte';

    export let object: Object;
</script>

<style>
    ul {
        background: #fff;
        margin: 3vh 0;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        border-radius: 1vh;
        list-style-type: none;
        text-align: left;
        overflow: auto;

        -webkit-overflow-scrolling: touch;
    }

    li {
        padding: 1.5vh 5vw;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    li:nth-last-child(n + 2) {
        border-bottom: 1px solid #f1f4fa;
    }

    li > p {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 3vw;
        line-height: 4vw;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #8593ac;
    }

    li > span {
        font-family: 'Metropolis Regular', sans-serif;
        font-weight: 600;
        font-size: 4vw;
        line-height: 6vw;
        color: #131f37;
    }
</style>

<ul>
    {#each Object.entries(object) as entry}
        <li>
            <p>{entry[0]}</p>
            {#if entry[1] && typeof entry[1] === 'object'}
                <ObjectList object="{entry[1]}" />
            {:else}<span>{entry[1]}</span>{/if}
        </li>
    {/each}
</ul>
