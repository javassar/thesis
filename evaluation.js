var evaluation_json = {
  "pages": [
    {
      "name": "page1-creativity",
      "elements": [
        {
          type: "rating",
          name: "creativity-rating",
          title: `Using your own subjective definition of creativity, how creative was this video game?`,
          isRequired: true,
          minRateDescription: "Very uncreative",
          maxRateDescription: "Very creative",
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
          title: `How original or novel is this game? Consider elements such as the mechanics, theme, narrative, and aesthetics`,
          isRequired: true,
          minRateDescription: "Very unoriginal",
          maxRateDescription: "Very original",
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
          title: `How well did the game work? Consider the level of detail, functionality, and overall enjoyability`,
          isRequired: true,
          minRateDescription: "Very poorly",
          maxRateDescription: "Very well",
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
          title: `How authentic did this game feel? Do you feel the creator was being "genuine," or does it feel like a "rip-off" of existing ideas?`,
          isRequired: true,
          minRateDescription: "Very unauthentic",
          maxRateDescription: "Very authentic",
          displayMode: "buttons"
        },
        {
          type: "rating",
          name: "first-attention-check",
          title: `This is an attention check question. Please select "Very imaginative" to show that you are paying attention.`,
          isRequired: true,
          minRateDescription: "Very unimaginative",
          maxRateDescription: "Very imaginative",
          displayMode: "buttons"
        },
        {
          type: "rating",
          name: "intentionality-rating",
          title: `How much do you feel this game reflects the developer's intentionality, personal effort, and lived experience?`,
          isRequired: true,
          minRateDescription: "Very unintentional",
          maxRateDescription: "Very intentional",
          displayMode: "buttons"
        },
        {
          type: "comment",
          name: "authenticity-intentionality-free-response",
          title: "Please briefly explain your ratings of authenticity, intentionality, and effort",
          isRequired: true,
        },
      ],
    }
  ]
};



