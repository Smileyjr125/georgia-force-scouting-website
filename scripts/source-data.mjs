export const groups = [
  {
    key: "single",
    title: "Single-Back — Shotgun (Q ahead of H)",
    formations: [
      {
        label: "Base 2-TE Look",
        diagram: "X  O O O  Y      A\n      Q  H",
        badges: [],
        plays: [
          {t:"8:00",game:"WCA",outcome:"pass",label:"Screen (WR)"},
          {t:"8:42",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"9:30",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"25:02",game:"WCA",outcome:"pass",label:"Screen (WR)"},
          {t:"56:15",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"57:43",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"58:39",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"2:24:54",game:"WCA",outcome:"run",label:"Run (Middle) — flip"},
        ]
      },
      {
        label: "TE Detached Left, WR Right",
        diagram: "   O O O  y       A\nX/\n    Q  H",
        badges: [],
        plays: [
          {t:"1:13:43",game:"AUG",outcome:"pass",label:"Pass"},
          {t:"1:14:42",game:"AUG",outcome:"run",label:"Run (R)"},
        ]
      },
      {
        label: "Bunch Left (Z+X), TE Right",
        diagram: "Z  X  O O O  y\n      Q  H",
        badges: ["Bunch"],
        plays: [
          {t:"1:10:29",game:"AUG",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "WR Left Isolated, TE Right",
        diagram: "Z      O O O  y      A\n       Q  H",
        badges: [],
        plays: [
          {t:"52:37",game:"AUG",outcome:"run",label:"Run (L)"},
          {t:"2:33:27",game:"AUG",outcome:"pass",label:"Pass (Quick)"},
        ]
      },
      {
        label: "WR Left, Full Line, WR Right",
        diagram: "Z   X O O O  y       A\n        Q  H",
        badges: [],
        plays: [
          {t:"15:58",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"21:37",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"26:15",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"27:50",game:"WCA",outcome:"run",label:"Run"},
          {t:"29:47",game:"WCA",outcome:"run",label:"Run (R)"},
          {t:"37:49",game:"WCA",outcome:"run",label:"Run (R)"},
        ]
      },
      {
        label: "TE-Line, TE-Right, WR Right (Screen Package)",
        diagram: "X  O O O       A\n         y\n   Q  H",
        badges: ["Screen tendency"],
        plays: [
          {t:"2:31:17",game:"AUG",outcome:"pass",label:"Screen (WR)"},
          {t:"2:23:58",game:"AUG",outcome:"pass",label:"Screen (WR) — flip"},
          {t:"49:56",game:"AUG",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "Both TEs Detached (Spread Look)",
        diagram: "    O O O\nX     Q  H     y  A",
        badges: [],
        plays: [
          {t:"1:11:18",game:"AUG",outcome:"pass",label:"Screen (WR) — flip"},
          {t:"1:12:47",game:"AUG",outcome:"pass",label:"Pass"},
          {t:"12:09",game:"AUG",outcome:"run",label:"Run (R)"},
          {t:"1:04:35",game:"AUG",outcome:"pass",label:"Pass to Guard (trick)"},
        ]
      },
      {
        label: "TE-Line, TE-Right, WR Right",
        diagram: "X  O O O  y      A\n      Q  H",
        badges: [],
        plays: [
          {t:"16:50",game:"WCA",outcome:"unclear",label:"False Start (no play)"},
          {t:"12:16",game:"WCA",outcome:"run",label:"Run (R)"},
        ]
      },
    ]
  },
  {
    key: "pistol",
    title: "Offset / Pistol Back (H ahead of Q)",
    formations: [
      {
        label: "TE-Right Attached, WR Right",
        diagram: "   O O O  y      A\n     H Q",
        badges: [],
        plays: [
          {t:"2:25:00",game:"AUG",outcome:"run",label:"Run (L)"},
          {t:"2:11:58",game:"AUG",outcome:"pass",label:"Pass to Guard (trick)"},
        ]
      },
      {
        label: "TE-Line, TE-Right, WR Right",
        diagram: "X  O O O  y      A\n      H Q",
        badges: [],
        plays: [
          {t:"24:05",game:"WCA",outcome:"run",label:"Run (L)"},
        ]
      },
      {
        label: "TE-Line, WR Left",
        diagram: "X  O O O       A\n Z\n      H Q",
        badges: [],
        plays: [
          {t:"27:07",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"2:13:08",game:"WCA",outcome:"pass",label:"Pass — flip"},
        ]
      },
      {
        label: "TE-Line, TE-Right, WR Right",
        diagram: "X  O O O       A\n         y\n      H Q",
        badges: [],
        plays: [
          {t:"41:34",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"1:43:13",game:"WCA",outcome:"pass",label:"Screen"},
          {t:"2:24:05",game:"WCA",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "WR Left, No TE-Right, WR Right",
        diagram: "Z      O O O      A\n   X\n      H Q",
        badges: [],
        plays: [
          {t:"42:51",game:"WCA",outcome:"pass",label:"Screen (L)"},
          {t:"1:09:17",game:"WCA",outcome:"run",label:"Run (Middle)"},
          {t:"1:43:13",game:"WCA",outcome:"pass",label:"Screen (R) — flip"},
        ]
      },
      {
        label: "TE-Line-TE, WR Right",
        diagram: "X O O O y   Z\n      H Q",
        badges: [],
        plays: [
          {t:"1:42:28",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"2:22:18",game:"WCA",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "WR Left, TE-Line-TE",
        diagram: "Z  X O O O y\n      H Q",
        badges: [],
        plays: [
          {t:"2:00:25",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"2:30:07",game:"WCA",outcome:"run",label:"Run (L) — flip"},
          {t:"2:31:22",game:"WCA",outcome:"run",label:"Run (L) — flip"},
          {t:"2:32:05",game:"WCA",outcome:"run",label:"Run (L) — flip"},
        ]
      },
      {
        label: "WR Left, TE-Line, WR Right",
        diagram: "Z  X O O O      A\n      H Q",
        badges: ["100% pass — 5 reps"],
        plays: [
          {t:"2:01:18",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"2:21:39",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"2:23:12",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"2:25:45",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"40:50",game:"WCA",outcome:"pass",label:"Pass (w/ motion)"},
        ]
      },
    ]
  },
  {
    key: "empty",
    title: "Empty Backfield (Q Alone)",
    formations: [
      {
        label: "TE-Line, TE-Right, WR Right",
        diagram: "X  O O O  y      A\n      Q",
        badges: [],
        plays: [
          {t:"2:02:19",game:"AUG",outcome:"pass",label:"Pass (Quick)"},
          {t:"2:31:58",game:"AUG",outcome:"run",label:"Run (L)"},
        ]
      },
      {
        label: "WR Left, TE-Line, TE-Right, WR Right",
        diagram: "Z  X O O O y      A\n       Q",
        badges: [],
        plays: [
          {t:"1:35:23",game:"AUG",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "TE-Line, TE+WR Stacked Right",
        diagram: "X O O O       A\n         y  z\n     Q",
        badges: ["Bunch", "100% pass — 4 reps"],
        plays: [
          {t:"2:03:47",game:"AUG",outcome:"pass",label:"Pass"},
          {t:"2:09:32",game:"AUG",outcome:"pass",label:"Pass"},
          {t:"2:32:42",game:"AUG",outcome:"pass",label:"Pass"},
          {t:"2:40:49",game:"AUG",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "TE-Line, TE-Right, WR Left+Right",
        diagram: "X  O O O  Z\n      y A\n   Q",
        badges: [],
        plays: [
          {t:"2:41:49",game:"AUG",outcome:"pass",label:"Pass — flip"},
          {t:"2:40:49",game:"AUG",outcome:"pass",label:"Pass"},
        ]
      },
      {
        label: "TE-Line, WR Left",
        diagram: "X O O O\n Z\n   Q",
        badges: [],
        plays: [
          {t:"14:54",game:"WCA",outcome:"run",label:"Run (R)"},
        ]
      },
      {
        label: "TE-Line-TE, WR Left+Right",
        diagram: "Y X O O O    A\n  Z\n     Q",
        badges: [],
        plays: [
          {t:"22:26",game:"WCA",outcome:"run",label:"Run (R)"},
        ]
      },
      {
        label: "TE-Line, TE+WR Stacked Right",
        diagram: "X O O O y      A\n     Q",
        badges: ["Bunch"],
        plays: [
          {t:"23:16",game:"WCA",outcome:"run",label:"Run (R)"},
        ]
      },
      {
        label: "WR Left, TE-Line, TE-Right",
        diagram: "Z  X O O O y\n      Q",
        badges: [],
        plays: [
          {t:"39:50",game:"WCA",outcome:"run",label:"Run (L)"},
        ]
      },
      {
        label: "TE-Line, WR Left+Right, TE-Right",
        diagram: "X O O O        A\n         y\nZ    Q",
        badges: [],
        plays: [
          {t:"43:45",game:"WCA",outcome:"run",label:"Run (L)"},
          {t:"44:36",game:"WCA",outcome:"run",label:"Run (R)"},
        ]
      },
      {
        label: "WR Left, TE Off-Ball, TE-Right, WR Right",
        diagram: "Z      O O O       A\n   X          y\n      Q",
        badges: [],
        plays: [
          {t:"1:07:56",game:"WCA",outcome:"pass",label:"Pass"},
          {t:"2:02:09",game:"WCA",outcome:"pass",label:"Pass"},
        ]
      },
    ]
  },
  {
    key: "twoback",
    title: "Two-Back Set",
    formations: [
      {
        label: "TE-Line, Two Backs, TE-Right, WR Right",
        diagram: "X  O O O  y       A\n    H  H",
        badges: ["Rare — watch for short yardage"],
        plays: [
          {t:"45:44",game:"WCA",outcome:"run",label:"Run (L)"},
        ]
      },
    ]
  },
];