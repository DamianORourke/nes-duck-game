import k from "./kaplayCtx";
import { COLORS, fontConfig } from "./constants";
import { formatScore } from "./utils";
import gameManager from "./gameManager";
import makeDog from "./entities/dog";
import makeDuck from "./entities/duck";


const audioCtx = (k as any).audioCtx;


k.loadFont("nes", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
k.loadSprite("menu", "./graphics/menu.png");
k.loadSprite("background", "./graphics/background.png");
k.loadSprite("cursor", "./graphics/cursor.png");
k.loadSprite("dog", "./graphics/dog.png", {
    sliceX: 4,
    sliceY: 3,
    anims: {
        search: { from: 0, to: 3, speed: 6, loop: true },
        snif: { from: 4, to: 5, speed: 4, loop: true },
        detect: 6,
        jump: { from: 7, to: 8, speed: 6 },
        catch: 9,
        mock: { from: 10, to: 11, loop: true }
    },
});
k.loadSprite("duck", "./graphics/duck.png", {
    sliceX: 8,
    sliceY: 1,
    anims: {
        "flight-diagonal": { from: 0, to: 2, loop: true },
        "flight-side": { from: 3, to: 5, loop: true },
        shot: 6,
        fall: 7
    },
});
k.loadSprite("text-box", "./graphics/text-box.png");
k.loadSound("gun-shot", "./sounds/gun-shot.wav");
k.loadSound("barking", "./sounds/barking.wav");
k.loadSound("fall", "./sounds/fall.wav");
k.loadSound("flapping", "./sounds/flapping.ogg");
k.loadSound("impact", "./sounds/impact.wav");
k.loadSound("laughing", "./sounds/laughing.wav");
k.loadSound("quacking", "./sounds/quacking.wav");
k.loadSound("sniffing", "./sounds/sniffing.wav");
k.loadSound("successful-hunt", "./sounds/successful-hunt.wav");
k.loadSound("ui-appear", "./sounds/ui-appear.wav");
k.loadSound("forest-ambiance", './sounds/forest-ambiance.wav');




k.scene("main-menu", () => {
    k.add([
        k.sprite("menu")
    ]);
    k.add([
        k.text("CLICK TO START", fontConfig),
        k.color(COLORS.BLUE),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 40)
    ]);
    let bestScore: number = k.getData("best-score") || 0;
    k.setData("best-score", bestScore);
    k.add([
        k.text(`TOP SCORE = ${formatScore(bestScore)}`, {
            font: "nes",
            size: 8
        }),
        k.pos(55, 184),
        k.color(COLORS.RED)
    ]);
    k.onClick(() => {
        k.go("game");
    });
});

k.scene("game", () => {
    k.setCursor("none");
    k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLUE), "sky"]);
    k.add([k.sprite("background"), k.pos(0, -10), k.z(1)]);
    const score = k.add([
        k.text(formatScore(0), fontConfig),
        k.pos(192, 197),
        k.z(2)
    ]);

    const roundCount = k.add([
        k.text('1', fontConfig),
        k.pos(42, 181),
        k.color(COLORS.RED),
        k.z(2)
    ]);

    const duckIcons = k.add([
        k.pos(95, 198)
    ]);
    let duckIconPosX = 1;
    for (let i = 0; i < 10; i++) {
        duckIcons.add([k.rect(7, 9), k.pos(duckIconPosX, 0), `duckIcon-${i}`]);
        duckIconPosX += 8;
    }

    const bulletUIMask = k.add([
        k.rect(0, 8),
        k.pos(25, 198),
        k.z(2),
        k.color(0, 0, 0)
    ]);

    const dog = makeDog(k.vec2(0, k.center().y));
    dog.searchForDucks();

    const roundStartController = gameManager.onStateEnter("round-start", async (isFirstRound: Boolean) => {
        if (!isFirstRound) gameManager.preySpeed += 50;
        k.play("ui-appear", { volume: 0.8 });
        gameManager.currentRoundNb++;
        roundCount.text = String(gameManager.currentRoundNb);
        const textBox = k.add([
            k.sprite("text-box"),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y - 50),
            k.z(2)
        ]);
        textBox.add([
            k.text("ROUND", fontConfig),
            k.anchor("center"),
            k.pos(0, -10)
        ]);
        textBox.add([
            k.text(String(gameManager.currentRoundNb), fontConfig),
            k.anchor("center"),
            k.pos(0, 4)
        ]);
        await k.wait(1);
        k.destroy(textBox);
        gameManager.enterState("hunt-start");
    });

    const roundEndController = gameManager.onStateEnter("round-end", () => {
        if (gameManager.nbDucksShotInRound) {
            k.go("game-over");
            return;
        }
        if (gameManager.nbDucksShotInRound === 10) {
            gameManager.currentScore += 500;
        }

        gameManager.nbDucksShotInRound = 0;
        for (const duckIcon of duckIcons.children) {
            duckIcon.color = k.color(255, 255, 255);
        }

        gameManager.enterState("round-start");
    });

    const huntStartController = gameManager.onStateEnter("hunt-start", () => {
        gameManager.currentHuntNb++;
        const duck = makeDuck(
            String(gameManager.currentHuntNb - 1),
            gameManager.preySpeed
        );
        duck.setBehavior();
    });

    const huntEndController = gameManager.onStateEnter("hunt-end", () => {
        const bestScore = Number(k.getData("best-score"));

        if (bestScore < gameManager.currentScore) {
            k.setData("best-score", gameManager.currentScore);
        }

        if (gameManager.currentHuntNb <= 9) {
            gameManager.enterState("hunt-start");
            return;
        }

        gameManager.currentHuntNb = 0;
        gameManager.enterState("round-end");
    });

    const duckHuntedController = gameManager.onStateEnter("duck-hunted", () => {
        gameManager.nbBulletsLeft = 3;
        dog.catchFallenDuck();
    });

    const duckEscapedController = gameManager.onStateEnter("duck-escaped", () => {
        dog.mockPlayer();
    });

    const cursor = k.add([
        k.sprite("cursor"), k.anchor("center"), k.pos(), k.z(3)
    ]);

    k.onClick(() => {
        if (gameManager.state === "hunt-start" && !gameManager.isGamePaused) {
            if (gameManager.nbBulletsLeft > 0) k.play('gun-shot', { volume: 0.5 });
            gameManager.nbBulletsLeft--;
        }
    });

    k.onUpdate(() => {
        score.text = formatScore(gameManager.currentScore);
        switch (gameManager.nbBulletsLeft) {
            case 3:
                bulletUIMask.width = 0;
                break;
            case 2:
                bulletUIMask.width = 8;
                break;
            case 1:
                bulletUIMask.width = 15;
                break;
            default:
                bulletUIMask.width = 22;
                break
        }

        cursor.moveTo(k.mousePos());
    });

    const forestAmbianceSound = k.play("forest-ambiance", {
        volume: 0.1,
        loop: true
    });
    k.onSceneLeave(() => {
        forestAmbianceSound.stop();
        roundStartController.cancel();
        roundEndController.cancel();
        huntStartController.cancel();
        huntEndController.cancel();
        duckHuntedController.cancel();
        duckEscapedController.cancel();
        gameManager.resetGameState();
    });

    k.onKeyPress((key) => {
        if (key === "p") {
            k.getTreeRoot().paused = !k.getTreeRoot().paused;
            if (k.getTreeRoot().paused) {
                gameManager.isGamePaused = true;
                //@ts-ignore
                audioCtx.suspend();
                k.add([
                    k.text("PAUSED", fontConfig),
                    k.pos(5, 5),
                    k.z(3),
                    "paused-text"
                ]);
                return;
            }
            gameManager.isGamePaused = false;
            //@ts-ignore
            audioCtx.resume();
            const pausedText = k.get("paused-text")[0];
            if (pausedText) {
                k.destroy(pausedText);
            }
        }
    });
});

k.scene("game-over", () => {
    k.add([
        k.rect(k.width(), k.height()),
        k.anchor("center"),
        k.pos(k.center()),
        k.color(0, 0, 0)
    ]);
    k.add([
        k.text("GAME OVER!", fontConfig),
        k.anchor("center"),
        k.pos(k.center()),
    ]);
    k.wait(2, () => {
        k.go("main-menu");
    });
});

k.go("main-menu");

