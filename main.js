document.addEventListener("DOMContentLoaded", function() {
    const pokemonOneSelect = document.getElementById('pokemonOne');
    const pokemonTwoSelect = document.getElementById('pokemonTwo');
    const chooseBtn = document.querySelector('.chooseBtn'); 

    const typeColors = {
        normal: "#A8A77A",
        fire: "#EE8130",
        water: "#6390F0",
        electric: "#F7D02C",
        grass: "#7AC74C",
        ice: "#96D9D6",
        fighting: "#C22E28",
        poison: "#A33EA1",
        ground: "#E2BF65",
        flying: "#A98FF3",
        psychic: "#F95587",
        bug: "#A6B91A",
        rock: "#B6A136",
        ghost: "#735797",
        dragon: "#6F35FC",
        dark: "#705746",
        steel: "#B7B7CE",
        fairy: "#D685AD"
    };
    

    class Pokemon {
        constructor(name, imageUrl, types, weight, length, stats) {
            this.name = name;
            this.imageUrl = imageUrl;
            this.types = types;
            this.weight = weight;
            this.length = length;
            this.stats = stats;
        }
    
        capitalizeName(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    
        display(container) {
            const typesHtml = this.types.map(type => 
                `<span class="type" style="background-color: ${typeColors[type]};">${type}</span>`
            ).join(' ');
    
            const capitalizedName = this.capitalizeName(this.name);
            const backgroundColor = typeColors[this.types[0]] || '#f8f8f8'; // Default color if type not found
            const dexEntryId = `dex-entry-${this.name.toLowerCase()}-${container.id}`; // Unique ID for dex entry
    
            container.innerHTML = `
                <div class="pokemon-card" style="background-color: ${backgroundColor};">
                    <div class="sprite-container">
                        <img class="sprite-image" src="${this.imageUrl}" alt="sprite of ${capitalizedName}" />
                    </div>
                    <div class="description-container">
                        <h1 class="name">${capitalizedName}</h1>
                        <div class="type-container">${typesHtml}</div>
                        <p class="text dex-entry" id="${dexEntryId}">Loading dex entry...</p>
                        <h3>Base Stats</h3>
                        <div class="stats-container">
                            <p>Weight: ${this.weight} kg</p>
                            <p>Length: ${this.length} cm</p>
                            ${this.stats.map(stat => `<span class="stat">${stat.name.toUpperCase()}: ${stat.value}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            this.loadDexEntry(dexEntryId);
        }
    
        async loadDexEntry(dexEntryId) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${this.name.toLowerCase()}/`);
                const data = await response.json();
                const entry = data.flavor_text_entries.find(e => e.language.name === 'en');
                const dexEntryText = entry ? entry.flavor_text.replace(/[\f\n\r]+/g, ' ') : 'No entry available';
                document.getElementById(dexEntryId).textContent = dexEntryText;
            } catch (error) {
                console.error('Failed to load dex entry:', error);
                document.getElementById(dexEntryId).textContent = 'Failed to load dex entry.';
            }
        }
    }
    
    
    

    async function fetchPokemon() {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
            const data = await response.json();
            data.results.forEach((pokemon, index) => {
                const option = document.createElement('option');
                option.value = index + 1;  // Assuming Pokémon ID corresponds to index + 1
                option.textContent = `${index + 1}. ${capitalizeName(pokemon.name)}`;
                pokemonOneSelect.appendChild(option);
                pokemonTwoSelect.appendChild(option.cloneNode(true));
            });
        } catch (error) {
            console.error('Failed to fetch Pokémon:', error);
        }
    }

    async function loadPokemonDetails(pokemonId, container) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const pokemonData = await response.json();
            const pokemon = new Pokemon(
                pokemonData.name,
                pokemonData.sprites.other['official-artwork'].front_default,
                pokemonData.types.map(type => type.type.name),
                pokemonData.weight / 10,
                pokemonData.height * 10,
                pokemonData.stats.map(stat => ({ name: stat.stat.name, value: stat.base_stat }))
            );
            pokemon.display(container);
        } catch (error) {
            console.error('Failed to load Pokémon details:', error);
        }
    }

    chooseBtn.addEventListener('click', () => {
        loadPokemonDetails(pokemonOneSelect.value, document.getElementById('pokemonOneDetails'));
        loadPokemonDetails(pokemonTwoSelect.value, document.getElementById('pokemonTwoDetails'));
    });

    function capitalizeName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    fetchPokemon();
});
