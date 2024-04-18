document.addEventListener("DOMContentLoaded", function () {
    const pokemonOneSelect = document.getElementById("pokemonOne");
    const pokemonTwoSelect = document.getElementById("pokemonTwo");
    const chooseBtn = document.querySelector(".chooseBtn");
    const comparisonDiv = document.querySelector('.comparisonResult');
    const battleLogDiv = document.querySelector('#battleLog');
    const compareBtn = document.querySelector("#compareBtn"); 
    const battleBtn = document.querySelector("#battleBtn");

    // Initially hide compare and battle buttons, comparison results, and battle log
    compareBtn.style.display = 'none';
    battleBtn.style.display = 'none';
    comparisonDiv.style.display = 'none';
    battleLogDiv.style.display = 'none';
        

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
        fairy: "#D685AD",
    };

    class Pokemon {
        constructor(name, imageUrl, types, weight, length, stats, moves) {
            this.name = name;
            this.imageUrl = imageUrl;
            this.types = types;
            this.weight = weight;
            this.length = length;
            this.stats = stats;
            this.moves = moves;
        }
    
        capitalizeName() {
            return this.name.charAt(0).toUpperCase() + this.name.slice(1);
        }
    
        getHp() {
            return this.stats.find(stat => stat.name === 'hp').value;
        }
    
        setHp(newHp) {
            const hpStat = this.stats.find(stat => stat.name === 'hp');
            hpStat.value = Math.max(0, newHp); // Ensure HP doesn't drop below zero
        }
    
        getRandomMove() {
            return this.moves.length > 0 ? this.moves[Math.floor(Math.random() * this.moves.length)] : "No move";
        }
    
        calculateDamage(defender) {
            const attack = this.stats.find(stat => stat.name === 'attack').value + this.stats.find(stat => stat.name === 'special-attack').value;
            const defense = defender.stats.find(stat => stat.name === 'defense').value + defender.stats.find(stat => stat.name === 'special-defense').value * 0.8;
            // Use Math.floor to round down the resulting damage to the nearest integer
            return Math.floor(Math.max(10, attack - defense));
        }
        

        display(container) {
            const typesHtml = this.types.map(type => `<span class="type" style="background-color: ${typeColors[type]}">${type}</span>`).join(" ");
            const capitalizedName = this.capitalizeName();
            const backgroundColor = typeColors[this.types[0]] || "#f8f8f8";
            const dexEntryId = `dex-entry-${this.name.toLowerCase()}-${container.id}`;

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
                            ${this.stats.map(stat => `<span class="stat">${stat.name.toUpperCase()}: ${stat.value}</span>`).join("")}
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
                const entry = data.flavor_text_entries.find(e => e.language.name === "en");
                const dexEntryText = entry ? entry.flavor_text.replace(/[\f\n\r]+/g, " ") : "No entry available";
                document.getElementById(dexEntryId).textContent = dexEntryText;
            } catch (error) {
                console.error("Failed to load dex entry:", error);
                document.getElementById(dexEntryId).textContent = "Failed to load dex entry.";
            }
        }
    }

    async function fetchPokemon() {
        try {
            const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
            const data = await response.json();
            data.results.forEach((pokemon, index) => {
                const option = document.createElement("option");
                // Ensure the value set here corresponds to the Pokémon ID expected by the API
                option.value = index + 1; // Assuming Pokémon IDs start at 1 and increment
                option.textContent = `${index + 1}. ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;
                pokemonOneSelect.appendChild(option);
                pokemonTwoSelect.appendChild(option.cloneNode(true));
            });
        } catch (error) {
            console.error("Failed to fetch Pokémon:", error);
        }
    }
    
    

    async function loadPokemonDetails(pokemonId, container) {
        try {
            // Adding no-cache headers to ensure fresh data is fetched every time
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) throw new Error('Network response was not ok.');
    
            const pokemonData = await response.json();
            
               // Fetch all moves without slicing the array
               const moves = pokemonData.moves.map(move => move.move.name);
    
            const pokemon = new Pokemon(
                pokemonData.name,
                pokemonData.sprites.other["official-artwork"].front_default,
                pokemonData.types.map(type => type.type.name),
                pokemonData.weight / 10,
                pokemonData.height * 10,
                pokemonData.stats.map(stat => ({ name: stat.stat.name, value: stat.base_stat })),
                moves
            );
    
            pokemon.display(container);
            container.pokemon = pokemon; // Store the Pokémon object directly on the element for later retrieval
        } catch (error) {
            console.error("Failed to load Pokémon details:", error);
        }
    }
    
    

    chooseBtn.addEventListener("click", async () => {
        await loadPokemonDetails(pokemonOneSelect.value, document.getElementById("pokemonOneDetails"));
        await loadPokemonDetails(pokemonTwoSelect.value, document.getElementById("pokemonTwoDetails"));
    
        // Show the compare button only after both Pokemon are loaded
        compareBtn.style.display = 'block';
    });
    
    compareBtn.addEventListener("click", () => {
        const pokemonOneDetails = document.getElementById('pokemonOneDetails').pokemon;
        const pokemonTwoDetails = document.getElementById('pokemonTwoDetails').pokemon;
    
        if (pokemonOneDetails && pokemonTwoDetails) {
            comparisonDiv.style.display = 'block'; // Show comparison results
            comparePokemons(pokemonOneDetails, pokemonTwoDetails);
            battleBtn.style.display = 'block'; // Show battle button after comparison
        } else {
            console.log("One or both Pokémon details are not loaded.");
        }
    });
    
    function resetPokemonHP(pokemon) {
    const originalStats = pokemon.stats; // Assuming original stats are not modified elsewhere
    const hpStat = originalStats.find(stat => stat.name === 'hp');
    pokemon.setHp(hpStat.value); // Reset HP to its original value
}

battleBtn.addEventListener("click", () => {
    const pokemonOneDetails = document.getElementById('pokemonOneDetails').pokemon;
    const pokemonTwoDetails = document.getElementById('pokemonTwoDetails').pokemon;

    if (pokemonOneDetails && pokemonTwoDetails) {
        resetPokemonHP(pokemonOneDetails); // Reset HP before starting a new battle
        resetPokemonHP(pokemonTwoDetails); // Reset HP before starting a new battle

        battleLogDiv.innerHTML = ''; // Clear previous battle logs before showing new ones
        battleLogDiv.style.display = 'block'; // Ensure the battle log is visible
        battlePokemons(pokemonOneDetails, pokemonTwoDetails);
    } else {
        console.log("One or both Pokémon details are not loaded.");
        battleLogDiv.style.display = 'none'; // Hide battle log if the details are not available
    }
});


    function comparePokemons(pokemon1, pokemon2) {
        let pokemon1Wins = 0;
        let pokemon2Wins = 0;
        const comparisonResults = [];
    
        const pokemon1Name = pokemon1.capitalizeName();
        const pokemon2Name = pokemon2.capitalizeName();
    
        // Adding units directly in the comparison output
        comparisonResults.push(compareAttribute('Weight', `${pokemon1.weight} kg`, `${pokemon2.weight} kg`));
        comparisonResults.push(compareAttribute('Length', `${pokemon1.length} cm`, `${pokemon2.length} cm`));
    
        // Compare other stats
        pokemon1.stats.forEach((stat, index) => {
            const value1 = stat.value;
            const value2 = pokemon2.stats[index].value;
            comparisonResults.push(compareAttribute(stat.name, `${value1}`, `${value2}`));
        });
    
        function compareAttribute(attribute, value1, value2) {
            // Convert values to numbers for comparison
            let num1 = parseFloat(value1);
            let num2 = parseFloat(value2);
    
            if (num1 > num2) {
                pokemon1Wins++;
                return `<p>${attribute}: <strong style="color: green;">${pokemon1Name} ${value1}</strong> vs ${pokemon2Name} ${value2}</p>`;
            } else if (num1 < num2) {
                pokemon2Wins++;
                return `<p>${attribute}: ${pokemon1Name} ${value1} vs <strong style="color: red;">${pokemon2Name} ${value2}</strong></p>`;
            } else {
                return `<p>${attribute}: ${pokemon1Name} ${value1} equals ${pokemon2Name} ${value2}</p>`;
            }
        }
    
        let resultSummary = `<h2>Comparison Result</h2>${comparisonResults.join('')}`;
        if (pokemon1Wins > pokemon2Wins) {
            resultSummary += `<p><strong>Summary:</strong> ${pokemon1Name} wins in most categories.</p>`;
        } else if (pokemon1Wins < pokemon2Wins) {
            resultSummary += `<p><strong>Summary:</strong> ${pokemon2Name} wins in most categories.</p>`;
        } else {
            resultSummary += `<p><strong>Summary:</strong> It is a tie!</p>`;
        }
        comparisonDiv.innerHTML = resultSummary;
    }
  


    document.getElementById('battleBtn').addEventListener('click', () => {
        const pokemonOneDetails = document.getElementById('pokemonOneDetails').pokemon;
        const pokemonTwoDetails = document.getElementById('pokemonTwoDetails').pokemon;
        if (pokemonOneDetails && pokemonTwoDetails) {
            battlePokemons(pokemonOneDetails, pokemonTwoDetails);
        } else {
            console.log("One or both Pokémon details are not loaded.");
        }
    });
    

    // Battle function
    function battlePokemons(pokemon1, pokemon2) {
        let attacker = pokemon1.stats.find(stat => stat.name === 'speed').value >= pokemon2.stats.find(stat => stat.name === 'speed').value ? pokemon1 : pokemon2;
        let defender = attacker === pokemon1 ? pokemon2 : pokemon1;
    
        const battleLog = document.getElementById('battleLog');
        battleLog.innerHTML = ''; // Clear previous battle logs
    
        let turn = 0; // Initialize turn counter
    
        function performAttack() {
            if (attacker.getHp() <= 0 || defender.getHp() <= 0) {
                const winner = attacker.getHp() > 0 ? attacker : defender;
                battleLog.innerHTML += `<strong>${winner.capitalizeName()} wins!</strong>`;
                return; // Exit the function to prevent further attacks after the battle ends
            }
        
            setTimeout(() => {
                if (attacker.getHp() > 0 && defender.getHp() > 0) {
                    const move = attacker.getRandomMove();
                    const damage = attacker.calculateDamage(defender);
                    defender.setHp(defender.getHp() - damage);
        
                    const logEntry = document.createElement('div');
                    logEntry.innerHTML = `${attacker.capitalizeName()} used ${move} and did ${damage} damage. ${defender.capitalizeName()} remaining HP: ${defender.getHp()}.`;
                    logEntry.classList.add('battle-entry'); // Apply CSS animation class
                    battleLog.appendChild(logEntry);
        
                    if (defender.getHp() <= 0) {
                        battleLog.innerHTML += `<strong>${attacker.capitalizeName()} wins!</strong>`;
                        return; // Stop further attacks
                    }
        
                    // Swap roles for the next turn
                    [attacker, defender] = [defender, attacker];
                    performAttack(); // Recursive call to continue the battle
                }
            }, 1000 * turn++); // Delay increases with each turn
        }
        
    
        performAttack(); // Start the battle
    }
    
    

    fetchPokemon();
});
