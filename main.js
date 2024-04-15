

document.addEventListener("DOMContentLoaded", function() {
  const pokemonOneSelect = document.getElementById('pokemonOne');
  const pokemonTwoSelect = document.getElementById('pokemonTwo');
  const compareBtn = document.getElementById('compareBtn');
  const battleBtn = document.getElementById('battleBtn');
  const pokemonOneDetails = document.getElementById('pokemonOneDetails');
  const pokemonTwoDetails = document.getElementById('pokemonTwoDetails');
  const comparisonResult = document.getElementById('comparisonResult');
  const battleLog = document.getElementById('battleLog');
  const chooseBtn = document.querySelector('.chooseBtn'); 

  async function fetchPokemon() {
      try {
          const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
          const data = await response.json();
          data.results.forEach((pokemon, index) => {
              const optionOne = document.createElement('option');
              optionOne.value = pokemon.url; 
              optionOne.textContent = `${index + 1}. ${capitalizeName(pokemon.name)}`; // Capitalize name
              pokemonOneSelect.appendChild(optionOne);

              const optionTwo = optionOne.cloneNode(true);
              pokemonTwoSelect.appendChild(optionTwo);
          });
      } catch (error) {
          console.error('Failed to fetch Pokémon:', error);
      }
  }

  async function loadPokemonDetails(url, container) {
    try {
        const response = await fetch(url);
        const pokemon = await response.json();
        // Create a function to generate HTML for types since they need special handling
        const typesHtml = pokemon.types.map(type => `<span class="type ${type.type.name}">${type.type.name}</span>`).join('');

        // Update the innerHTML of the container to use the card layout
        container.innerHTML = `
            <div class="pokemon-card">
                <div class="sprite-container">
                    <span class="shiny-button">
                        <img src="./img/stars.svg" alt="shiny icon" class="star-svg" />
                    </span>
                    <img class="sprite-image" src="${pokemon.sprites.other.dream_world.front_default}" alt="sprite of ${capitalizeName(pokemon.name)}" />
                </div>
                <div class="description-container">
                    <h1 class="name">${capitalizeName(pokemon.name)}</h1>
                    <div class="type-container">${typesHtml}</div>
                    <p class="text dex-entry">Some default dex entry here, replace with actual if available.</p>
                    <h3>Base Stats</h3>
                    <div class="stats-container">
                        ${pokemon.stats.map(stat => `<span class="stat">${stat.stat.name.toUpperCase()}: ${stat.base_stat}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load Pokémon details:', error);
    }
}


  chooseBtn.addEventListener('click', () => {
      loadPokemonDetails(pokemonOneSelect.value, pokemonOneDetails);
      loadPokemonDetails(pokemonTwoSelect.value, pokemonTwoDetails);
  });

  compareBtn.addEventListener('click', comparePokemon);
  battleBtn.addEventListener('click', battlePokemon);

  fetchPokemon();
});

function capitalizeName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function comparePokemon() {
    // Implementation of comparison logic here
}

function battlePokemon() {
    // Implementation of battle logic here
}
