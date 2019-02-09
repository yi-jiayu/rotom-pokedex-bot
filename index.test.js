const bot = require("./index.js");

function newMessage(text) {
    return {
        message: {
            chat: {
                id: 1,
            },
            text,
        }
    };
}

function newInlineQuery(query) {
    return {
        inline_query: {
            id: 1,
            query,
        }
    };
}

describe("when messaged directly", () => {
    test("with full pokemon name", () => {
        const json = jest.fn();
        bot.handler({body: newMessage("turtwig")}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "parse_mode": "Markdown",
            "text": `*Turtwig (#387)*
Type: Grass
Weak Against: Flying(2x)/Bug(2x)/Fire(2x)/Ice(2x)/Poison(2x)/Ground(0.5x)/Water(0.5x)/Grass(0.5x)/Electric(0.5x)
Abilities: Overgrow
Height: 1' 4"
Weight: 22.5 lbs
[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)`
        });
    });

    test("with partial pokemon name", () => {
        const json = jest.fn();
        bot.handler({body: newMessage("turt")}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "parse_mode": "Markdown",
            "text": `*Turtwig (#387)*
Type: Grass
Weak Against: Flying(2x)/Bug(2x)/Fire(2x)/Ice(2x)/Poison(2x)/Ground(0.5x)/Water(0.5x)/Grass(0.5x)/Electric(0.5x)
Abilities: Overgrow
Height: 1' 4"
Weight: 22.5 lbs
[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)`
        });
    });

    test("with nonexistent pokemon name", () => {
        const json = jest.fn();
        bot.handler({body: newMessage("digimon")}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "text": "Couldn't find a matching Pokémon!"
        });
    });

    test("weakness and immunity", () => {
        const json = jest.fn();
        bot.handler({body: newMessage("whiscash")}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "parse_mode": "Markdown",
            "text": `*Whiscash (#340)*
Type: Water/Ground
Weak Against: Grass(4x)/Steel(0.5x)/Fire(0.5x)/Poison(0.5x)/Rock(0.5x)
Immune to: Electric
Abilities: Anticipation, Oblivious
Height: 2' 11"
Weight: 52 lbs
[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/340.png)`
        });
    });

    test("weakness and immunity 2", () => {
        const json = jest.fn();
        bot.handler({body: newMessage("froslass")}, {json});
        expect(json.mock.calls[0][0]).toEqual({
            "chat_id": 1,
            "method": "sendMessage",
            "parse_mode": "Markdown",
            "text": `*Froslass (#478)*
Type: Ice/Ghost
Weak Against: Rock(2x)/Steel(2x)/Fire(2x)/Ghost(2x)/Dark(2x)/Ice(0.5x)/Poison(0.5x)/Bug(0.5x)
Immune to: Fighting/Normal
Abilities: Snow Cloak
Height: 4' 3"
Weight: 58.6 lbs
[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/478.png)`
        });
    });
});

describe("when sent an inline query", function () {
    test("with full pokemon name", () => {
        const json = jest.fn();
        bot.handler({body: newInlineQuery("turtwig")}, {json});
        const reply = json.mock.calls[0][0];
        expect(reply.inline_query_id).toEqual(1);
        expect(reply.method).toEqual("answerInlineQuery");
        expect(JSON.parse(reply.results)).toEqual([
            {
                "description": "Grass",
                "id": 387,
                "input_message_content": {
                    "message_text": "*Turtwig (#387)*\nType: Grass\nWeak Against: Flying(2x)/Bug(2x)/Fire(2x)/Ice(2x)/Poison(2x)/Ground(0.5x)/Water(0.5x)/Grass(0.5x)/Electric(0.5x)\nAbilities: Overgrow\nHeight: 1' 4\"\nWeight: 22.5 lbs\n[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)",
                    "parse_mode": "Markdown"
                },
                "thumb_url": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/387.png",
                "title": "Turtwig (#387)",
                "type": "article"
            }
        ]);
    });

    test("with partial pokemon name", () => {
        const json = jest.fn();
        bot.handler({body: newInlineQuery("turt")}, {json});
        const reply = json.mock.calls[0][0];
        expect(reply.inline_query_id).toEqual(1);
        expect(reply.method).toEqual("answerInlineQuery");
        expect(JSON.parse(reply.results)).toEqual([
            {
                "description": "Grass",
                "id": 387,
                "input_message_content": {
                    "message_text": "*Turtwig (#387)*\nType: Grass\nWeak Against: Flying(2x)/Bug(2x)/Fire(2x)/Ice(2x)/Poison(2x)/Ground(0.5x)/Water(0.5x)/Grass(0.5x)/Electric(0.5x)\nAbilities: Overgrow\nHeight: 1' 4\"\nWeight: 22.5 lbs\n[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/387.png)",
                    "parse_mode": "Markdown"
                },
                "thumb_url": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/387.png",
                "title": "Turtwig (#387)",
                "type": "article"
            },
            {
                "description": "Fire/Dragon",
                "id": 776,
                "input_message_content": {
                    "message_text": "*Turtonator (#776)*\nType: Fire/Dragon\nWeak Against: Ground(2x)/Rock(2x)/Dragon(2x)/Bug(0.5x)/Steel(0.5x)/Electric(0.5x)/Fire(0.25x)/Grass(0.25x)\nAbilities: Shell Armor\nHeight: 6' 7\"\nWeight: 467.4 lbs\n[Image](https://assets.pokemon.com/assets/cms2/img/pokedex/full/776.png)",
                    "parse_mode": "Markdown"
                },
                "thumb_url": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/776.png",
                "title": "Turtonator (#776)",
                "type": "article"
            }
        ]);
    });

    test("with nonexistent pokemon name", () => {
        const sendStatus = jest.fn();
        bot.handler({body: newInlineQuery("digimon")}, {sendStatus});
        expect(sendStatus.mock.calls[0][0]).toEqual(200);
    });
});
