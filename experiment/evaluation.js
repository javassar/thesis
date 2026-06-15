var evaluation_json = {
  "pages": [
    {
      "name": "page1-creativity",
      "elements": [
        {
          type: "rating",
          name: "creativity-rating",
          title: `Using your own subjective definition of creativity, how creative was the video game?`,
          isRequired: true,
          minRateDescription: "Not at all creative",
          maxRateDescription: "Extremely creative",
          displayMode: "buttons"
        },
        {
          type: "comment",
          name: "creativity-free-response",
          title: "Please explain your rating. What made the game creative or uncreative, and why?",
          isRequired: true,
        },
      ],
    },
    {
      "name": "page2-originality",
      "elements": [
        {
          type: "rating",
          name: "originality-rating",
          title: `How original or novel was the game? Consider elements such as the mechanics, theme, narrative, and aesthetics.`,
          isRequired: true,
          minRateDescription: "Not at all original",
          maxRateDescription: "Extremely original",
          displayMode: "buttons"
        },
        {
          type: "comment",
          name: "originality-free-response",
          title: "Please explain your rating. What parts of the game felt original or unoriginal, and why? Did any parts cause a sense of surprise?",
          isRequired: true,
        },
      ],
    },
    {
      "name": "page3-effectiveness",
      "elements": [
        {
          type: "rating",
          name: "effectiveness-rating",
          title: `How enjoyable was the game? Consider qualities such as level of detail, functionality, and entertainment.`,
          isRequired: true,
          minRateDescription: "Not at all enjoyable",
          maxRateDescription: "Extremely enjoyable",
          displayMode: "buttons"
        },
        {
          type: "comment",
          name: "effectiveness-free-response",
          title: "Please explain your rating. What did or didn’t work well? What parts of the game were enjoyable or frustrating, and why?",
          isRequired: true,
        },
      ],
    },
    {
      "name": "page4-authenticity-intentionality",
      "elements": [
        {
          type: "rating",
          name: "authenticity-rating",
          title: `How authentic did the game feel? Do you feel the developer was being "genuine," or does it feel like a "rip-off" of existing ideas?`,
          isRequired: true,
          minRateDescription: "Not at all authentic",
          maxRateDescription: "Extremely authentic",
          displayMode: "buttons"
        },
        {
          type: "rating",
          name: "attention-check",
          title: `This is an attention check question. Please select '3' to show that you are paying attention.`,
          isRequired: true,
          minRateDescription: "Not at all imaginative",
          maxRateDescription: "Extremely imaginative",
          displayMode: "buttons"
        },
        {
          type: "rating",
          name: "intentionality-rating",
          title: `How much do you feel this game reflected the developer's intentionality and personal effort?`,
          isRequired: true,
          minRateDescription: "Not at all intentional",
          maxRateDescription: "Extremely intentional",
          displayMode: "buttons"
        },
        {
          type: "comment",
          name: "authenticity-intentionality-free-response",
          title: "Please briefly explain your ratings of authenticity, intentionality, and effort.",
          isRequired: true,
        },
      ],
    }
  ]
};

        