/* =========================================================
   SORTING LAB — vanilla JS, no dependencies
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     HELPERS
     --------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const rangeArr = (a, b) => {
    const out = [];
    for (let k = a; k <= b; k++) out.push(k);
    return out;
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /** Build a normalized snapshot object for a single animation step. */
  function snap(arr, opts) {
    opts = opts || {};
    return {
      array: arr.slice(),
      compare: opts.compare || [],
      swap: opts.swap || [],
      pivot: opts.pivot === undefined ? null : opts.pivot,
      activeRange: opts.activeRange || null,
      sortedIndices: opts.sortedIndices || [],
      message: opts.message || "",
    };
  }

  /* ---------------------------------------------------------
     STEP GENERATORS
     Each returns an array of snap() objects describing the
     entire run of the algorithm on the given input array.
     --------------------------------------------------------- */

  function bubbleSortSteps(input) {
    const arr = input.slice();
    const n = arr.length;
    const steps = [];
    const sorted = new Set();

    steps.push(
      snap(arr, {
        message: `We start with [${arr.join(", ")}]. Bubble sort repeatedly walks through the list, comparing neighbours and swapping them if they are out of order.`,
      })
    );

    for (let i = 0; i < n - 1; i++) {
      let swappedAny = false;
      for (let j = 0; j < n - 1 - i; j++) {
        const a = arr[j];
        const b = arr[j + 1];
        if (a > b) {
          arr[j] = b;
          arr[j + 1] = a;
          swappedAny = true;
          steps.push(
            snap(arr, {
              swap: [j, j + 1],
              sortedIndices: [...sorted],
              message: `Comparing ${a} and ${b}. Since ${a} is greater than ${b}, we swap them. Array becomes [${arr.join(", ")}].`,
            })
          );
        } else {
          steps.push(
            snap(arr, {
              compare: [j, j + 1],
              sortedIndices: [...sorted],
              message: `Comparing ${a} and ${b}. Since ${a} is smaller than or equal to ${b}, we leave them in place.`,
            })
          );
        }
      }
      sorted.add(n - 1 - i);
      steps.push(
        snap(arr, {
          sortedIndices: [...sorted],
          message: `The largest value in this unsorted section has "bubbled" to position ${n - i}. It is now locked in.`,
        })
      );
      if (!swappedAny) break;
    }
    for (let k = 0; k < n; k++) sorted.add(k);
    steps.push(
      snap(arr, {
        sortedIndices: [...sorted],
        message: `No swaps were needed on the last pass, so the array is fully sorted: [${arr.join(", ")}].`,
      })
    );
    return steps;
  }

  function selectionSortSteps(input) {
    const arr = input.slice();
    const n = arr.length;
    const steps = [];
    const sorted = new Set();

    steps.push(
      snap(arr, {
        message: `We start with [${arr.join(", ")}]. Selection sort scans the unsorted section for the smallest value and moves it to the front.`,
      })
    );

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push(
        snap(arr, {
          compare: [i],
          sortedIndices: [...sorted],
          message: `Looking for the smallest value from position ${i + 1} onward. We start by assuming ${arr[i]} is the smallest.`,
        })
      );
      for (let j = i + 1; j < n; j++) {
        steps.push(
          snap(arr, {
            compare: [minIdx, j],
            sortedIndices: [...sorted],
            message: `Comparing the current smallest, ${arr[minIdx]}, with ${arr[j]}.`,
          })
        );
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push(
            snap(arr, {
              compare: [minIdx],
              sortedIndices: [...sorted],
              message: `${arr[j]} is smaller. It becomes our new candidate for smallest value.`,
            })
          );
        }
      }
      if (minIdx !== i) {
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        steps.push(
          snap(arr, {
            swap: [i, minIdx],
            sortedIndices: [...sorted],
            message: `Swapping ${arr[minIdx]} and ${arr[i]} to move the smallest value into position ${i + 1}. Array becomes [${arr.join(", ")}].`,
          })
        );
      } else {
        steps.push(
          snap(arr, {
            sortedIndices: [...sorted],
            message: `${arr[i]} was already the smallest remaining value, so no swap is needed.`,
          })
        );
      }
      sorted.add(i);
      steps.push(
        snap(arr, {
          sortedIndices: [...sorted],
          message: `Position ${i + 1} is now locked in with value ${arr[i]}.`,
        })
      );
    }
    sorted.add(n - 1);
    steps.push(
      snap(arr, {
        sortedIndices: [...sorted],
        message: `Only one value remains in the unsorted section, so it must already be in the right place. The array is fully sorted: [${arr.join(", ")}].`,
      })
    );
    return steps;
  }

  function insertionSortSteps(input) {
    const arr = input.slice();
    const n = arr.length;
    const steps = [];

    steps.push(
      snap(arr, {
        sortedIndices: [0],
        message: `We start with [${arr.join(", ")}]. Insertion sort builds a sorted section at the front, one value at a time. ${arr[0]} alone counts as sorted.`,
      })
    );

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      steps.push(
        snap(arr, {
          compare: [i],
          sortedIndices: rangeArr(0, i - 1),
          message: `Picking up ${key} from position ${i + 1} to insert it into the sorted section on its left.`,
        })
      );
      while (j >= 0 && arr[j] > key) {
        steps.push(
          snap(arr, {
            compare: [j, j + 1],
            sortedIndices: rangeArr(0, i - 1),
            message: `${arr[j]} is greater than ${key}, so we shift ${arr[j]} one place to the right.`,
          })
        );
        arr[j + 1] = arr[j];
        steps.push(
          snap(arr, {
            swap: [j + 1],
            sortedIndices: rangeArr(0, i - 1),
            message: `Array is now [${arr.join(", ")}].`,
          })
        );
        j--;
      }
      arr[j + 1] = key;
      steps.push(
        snap(arr, {
          swap: [j + 1],
          sortedIndices: rangeArr(0, i),
          message: `${key} fits at position ${j + 2}. Array becomes [${arr.join(", ")}].`,
        })
      );
    }
    steps.push(
      snap(arr, {
        sortedIndices: rangeArr(0, n - 1),
        message: `Every value has been inserted in its correct place. The array is fully sorted: [${arr.join(", ")}].`,
      })
    );
    return steps;
  }

  function mergeSortSteps(input) {
    const arr = input.slice();
    const n = arr.length;
    const steps = [];

    steps.push(
      snap(arr, {
        message: `We start with [${arr.join(", ")}]. Merge sort splits the array into halves, sorts each half recursively, then merges the sorted halves back together.`,
      })
    );

    function mergeSort(lo, hi) {
      if (hi - lo <= 0) return;
      const mid = Math.floor((lo + hi) / 2);
      steps.push(
        snap(arr, {
          activeRange: [lo, hi],
          message: `Splitting positions ${lo + 1}–${hi + 1} into two halves: [${arr.slice(lo, mid + 1).join(", ")}] and [${arr.slice(mid + 1, hi + 1).join(", ")}].`,
        })
      );
      mergeSort(lo, mid);
      mergeSort(mid + 1, hi);
      merge(lo, mid, hi);
    }

    function merge(lo, mid, hi) {
      const left = arr.slice(lo, mid + 1);
      const right = arr.slice(mid + 1, hi + 1);
      let i = 0,
        j = 0,
        k = lo;
      steps.push(
        snap(arr, {
          activeRange: [lo, hi],
          message: `Merging [${left.join(", ")}] and [${right.join(", ")}] back into positions ${lo + 1}–${hi + 1}.`,
        })
      );
      while (i < left.length && j < right.length) {
        steps.push(
          snap(arr, {
            activeRange: [lo, hi],
            compare: [k],
            message: `Comparing ${left[i]} and ${right[j]}.`,
          })
        );
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          steps.push(
            snap(arr, {
              activeRange: [lo, hi],
              swap: [k],
              message: `${left[i]} is smaller or equal, so it goes into position ${k + 1}.`,
            })
          );
          i++;
        } else {
          arr[k] = right[j];
          steps.push(
            snap(arr, {
              activeRange: [lo, hi],
              swap: [k],
              message: `${right[j]} is smaller, so it goes into position ${k + 1}.`,
            })
          );
          j++;
        }
        k++;
      }
      while (i < left.length) {
        arr[k] = left[i];
        steps.push(
          snap(arr, {
            activeRange: [lo, hi],
            swap: [k],
            message: `Copying the remaining value ${left[i]} into position ${k + 1}.`,
          })
        );
        i++;
        k++;
      }
      while (j < right.length) {
        arr[k] = right[j];
        steps.push(
          snap(arr, {
            activeRange: [lo, hi],
            swap: [k],
            message: `Copying the remaining value ${right[j]} into position ${k + 1}.`,
          })
        );
        j++;
        k++;
      }
      steps.push(
        snap(arr, {
          activeRange: [lo, hi],
          message: `Positions ${lo + 1}–${hi + 1} are now merged and sorted: [${arr.slice(lo, hi + 1).join(", ")}].`,
        })
      );
    }

    mergeSort(0, n - 1);
    steps.push(
      snap(arr, {
        sortedIndices: rangeArr(0, n - 1),
        message: `All sections have been merged. The array is fully sorted: [${arr.join(", ")}].`,
      })
    );
    return steps;
  }

  function quickSortSteps(input) {
    const arr = input.slice();
    const n = arr.length;
    const steps = [];
    const sortedSet = new Set();

    steps.push(
      snap(arr, {
        message: `We start with [${arr.join(", ")}]. Quick sort picks a pivot, partitions the array so smaller values sit left of it and larger values sit right of it, then repeats on each side.`,
      })
    );

    function partition(lo, hi) {
      const pivot = arr[hi];
      steps.push(
        snap(arr, {
          pivot: hi,
          activeRange: [lo, hi],
          sortedIndices: [...sortedSet],
          message: `Choosing ${pivot} (the last element of this section) as the pivot.`,
        })
      );
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        steps.push(
          snap(arr, {
            pivot: hi,
            compare: [j],
            activeRange: [lo, hi],
            sortedIndices: [...sortedSet],
            message: `Comparing ${arr[j]} with pivot ${pivot}.`,
          })
        );
        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
            steps.push(
              snap(arr, {
                pivot: hi,
                swap: [i, j],
                activeRange: [lo, hi],
                sortedIndices: [...sortedSet],
                message: `${arr[i]} is smaller than the pivot, so we move it into the left region. Array becomes [${arr.join(", ")}].`,
              })
            );
          } else {
            steps.push(
              snap(arr, {
                pivot: hi,
                compare: [i],
                activeRange: [lo, hi],
                sortedIndices: [...sortedSet],
                message: `${arr[i]} is smaller than the pivot and already in the left region.`,
              })
            );
          }
        }
      }
      const tmp = arr[i + 1];
      arr[i + 1] = arr[hi];
      arr[hi] = tmp;
      steps.push(
        snap(arr, {
          pivot: i + 1,
          swap: [i + 1, hi],
          activeRange: [lo, hi],
          sortedIndices: [...sortedSet],
          message: `Placing the pivot ${arr[i + 1]} between the smaller and larger values. Array becomes [${arr.join(", ")}].`,
        })
      );
      return i + 1;
    }

    function quickSort(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) {
        sortedSet.add(lo);
        return;
      }
      const p = partition(lo, hi);
      sortedSet.add(p);
      steps.push(
        snap(arr, {
          activeRange: [lo, hi],
          sortedIndices: [...sortedSet],
          message: `Pivot ${arr[p]} is now in its correct final position (position ${p + 1}). We repeat this process on each side of it.`,
        })
      );
      quickSort(lo, p - 1);
      quickSort(p + 1, hi);
    }

    quickSort(0, n - 1);
    for (let k = 0; k < n; k++) sortedSet.add(k);
    steps.push(
      snap(arr, {
        sortedIndices: rangeArr(0, n - 1),
        message: `Every section has been partitioned down to its correct position. The array is fully sorted: [${arr.join(", ")}].`,
      })
    );
    return steps;
  }

  /* ---------------------------------------------------------
     ALGORITHM REGISTRY — generators + educational content
     --------------------------------------------------------- */

  const ALGORITHMS = {
    bubble: {
      label: "Bubble Sort",
      textbookArray: [5, 1, 4, 2, 8],
      generator: bubbleSortSteps,
      definition:
        "Bubble sort is a comparison-based sorting algorithm that repeatedly steps through the list, compares each pair of adjacent elements, and swaps them if they are in the wrong order. This process repeats until a full pass is made with no swaps, which means the list is sorted. With each pass, the next-largest unsorted value \"bubbles up\" to its correct position at the end of the list, much like a bubble rising to the surface of water.",
      complexities: [
        { case: "Best Case", bigO: "O(n)", meaning: "The array is already sorted, so a single pass finds no swaps and the algorithm stops early." },
        { case: "Average Case", bigO: "O(n²)", meaning: "Elements are in random order, so most pairs need to be compared and roughly half need swapping." },
        { case: "Worst Case", bigO: "O(n²)", meaning: "The array is sorted in reverse order, so every comparison also requires a swap." },
        { case: "Space Complexity", bigO: "O(1)", meaning: "Sorting happens in place using only a fixed amount of extra memory for swapping.", isSpace: true },
      ],
      example: {
        array: [5, 1, 4, 2, 8],
        intro: "We trace one full run of bubble sort on the textbook array [5, 1, 4, 2, 8].",
        steps: [
          "Pass 1: Compare 5 and 1 → swap → [1, 5, 4, 2, 8]",
          "Pass 1: Compare 5 and 4 → swap → [1, 4, 5, 2, 8]",
          "Pass 1: Compare 5 and 2 → swap → [1, 4, 2, 5, 8]",
          "Pass 1: Compare 5 and 8 → no swap → [1, 4, 2, 5, 8]. Largest value 8 is now fixed at the end.",
          "Pass 2: Compare 1 and 4 → no swap → [1, 4, 2, 5, 8]",
          "Pass 2: Compare 4 and 2 → swap → [1, 2, 4, 5, 8]",
          "Pass 2: Compare 4 and 5 → no swap → [1, 2, 4, 5, 8]. Position of 5 is now fixed.",
          "Pass 3: Compare 1 and 2 → no swap. Compare 2 and 4 → no swap → [1, 2, 4, 5, 8]",
          "No swaps occurred in Pass 3 (ignoring the already-fixed tail), so the algorithm stops. Final result: [1, 2, 4, 5, 8].",
        ],
      },
    },

    selection: {
      label: "Selection Sort",
      textbookArray: [64, 25, 12, 22, 11],
      generator: selectionSortSteps,
      definition:
        "Selection sort divides the list into a sorted section at the front and an unsorted section at the back. On each pass, it searches the entire unsorted section for the smallest value, then swaps that value into the next open position of the sorted section. Unlike bubble sort, selection sort makes at most one swap per pass, though it still performs the same number of comparisons.",
      complexities: [
        { case: "Best Case", bigO: "O(n²)", meaning: "Even if the array is already sorted, the algorithm still scans the entire unsorted section on every pass to confirm the minimum." },
        { case: "Average Case", bigO: "O(n²)", meaning: "Every pass compares the current minimum against all remaining unsorted elements, regardless of their order." },
        { case: "Worst Case", bigO: "O(n²)", meaning: "The number of comparisons stays the same no matter the input order, so the worst case matches the average case." },
        { case: "Space Complexity", bigO: "O(1)", meaning: "Only a few extra variables are needed to track the minimum index, so sorting happens in place.", isSpace: true },
      ],
      example: {
        array: [64, 25, 12, 22, 11],
        intro: "We trace one full run of selection sort on the textbook array [64, 25, 12, 22, 11].",
        steps: [
          "Pass 1: Smallest in [64,25,12,22,11] is 11 → swap with position 1 → [11, 25, 12, 22, 64]",
          "Pass 2: Smallest in [25,12,22,64] is 12 → swap with position 2 → [11, 12, 25, 22, 64]",
          "Pass 3: Smallest in [25,22,64] is 22 → swap with position 3 → [11, 12, 22, 25, 64]",
          "Pass 4: Smallest in [25,64] is 25 → already in place, no swap → [11, 12, 22, 25, 64]",
          "One element remains (64), which must already be sorted. Final result: [11, 12, 22, 25, 64].",
        ],
      },
    },

    insertion: {
      label: "Insertion Sort",
      textbookArray: [12, 11, 13, 5, 6],
      generator: insertionSortSteps,
      definition:
        "Insertion sort builds the final sorted array one element at a time. It takes the next unsorted value, called the key, and shifts it leftward past every element in the sorted section that is greater than it, inserting the key into its correct position. It works much like a person sorting playing cards in their hand, one card at a time.",
      complexities: [
        { case: "Best Case", bigO: "O(n)", meaning: "The array is already sorted, so each key only needs a single comparison against its left neighbour before staying put." },
        { case: "Average Case", bigO: "O(n²)", meaning: "Each key typically needs to shift past roughly half of the already-sorted elements to its left." },
        { case: "Worst Case", bigO: "O(n²)", meaning: "The array is sorted in reverse order, so every key must shift past all previously sorted elements." },
        { case: "Space Complexity", bigO: "O(1)", meaning: "Elements are shifted within the same array, so no extra array is required.", isSpace: true },
      ],
      example: {
        array: [12, 11, 13, 5, 6],
        intro: "We trace one full run of insertion sort on the textbook array [12, 11, 13, 5, 6].",
        steps: [
          "Key = 11. Shift 12 right → [12, 12, 13, 5, 6] → insert 11 → [11, 12, 13, 5, 6]",
          "Key = 13. 13 is already greater than 12, no shift needed → [11, 12, 13, 5, 6]",
          "Key = 5. Shift 13, 12, 11 right → insert 5 at the front → [5, 11, 12, 13, 6]",
          "Key = 6. Shift 13, 12, 11 right (stop before 5) → insert 6 → [5, 6, 11, 12, 13]",
          "All keys have been inserted. Final result: [5, 6, 11, 12, 13].",
        ],
      },
    },

    merge: {
      label: "Merge Sort",
      textbookArray: [38, 27, 43, 3, 9, 82, 10],
      generator: mergeSortSteps,
      definition:
        "Merge sort is a divide-and-conquer algorithm. It repeatedly splits the array in half until each piece contains a single element (which is trivially sorted), then merges pairs of sorted pieces back together in the correct order. The merge step compares the front of each half and always takes the smaller value first, which guarantees the combined result is sorted.",
      complexities: [
        { case: "Best Case", bigO: "O(n log n)", meaning: "The array always gets split in half and merged, so performance does not improve even if the input is already sorted." },
        { case: "Average Case", bigO: "O(n log n)", meaning: "Splitting takes log n levels, and merging all elements at each level takes O(n), giving O(n log n) overall." },
        { case: "Worst Case", bigO: "O(n log n)", meaning: "The divide-and-merge pattern is identical regardless of input order, so the worst case matches the best case." },
        { case: "Space Complexity", bigO: "O(n)", meaning: "Merging requires temporary arrays to hold the left and right halves while combining them.", isSpace: true },
      ],
      example: {
        array: [38, 27, 43, 3, 9, 82, 10],
        intro: "We trace one full run of merge sort on the textbook array [38, 27, 43, 3, 9, 82, 10].",
        steps: [
          "Split into [38, 27, 43] and [3, 9, 82, 10]",
          "Split [38, 27, 43] into [38] and [27, 43], then [27] and [43]",
          "Merge [27] and [43] → [27, 43]. Merge [38] and [27, 43] → [27, 38, 43]",
          "Split [3, 9, 82, 10] into [3, 9] and [82, 10], each split further into single elements",
          "Merge [3] and [9] → [3, 9]. Merge [82] and [10] → [10, 82]",
          "Merge [3, 9] and [10, 82] → [3, 9, 10, 82]",
          "Merge [27, 38, 43] and [3, 9, 10, 82] → compare fronts repeatedly → [3, 9, 10, 27, 38, 43, 82]",
          "Final result: [3, 9, 10, 27, 38, 43, 82].",
        ],
      },
    },

    quick: {
      label: "Quick Sort",
      textbookArray: [10, 7, 8, 9, 1, 5],
      generator: quickSortSteps,
      definition:
        "Quick sort is a divide-and-conquer algorithm that selects a pivot element and partitions the rest of the array into two groups: values smaller than the pivot and values larger than the pivot. After partitioning, the pivot sits in its final sorted position. The same process is then applied recursively to the smaller and larger groups until the whole array is sorted.",
      complexities: [
        { case: "Best Case", bigO: "O(n log n)", meaning: "The pivot consistently splits the array into two roughly equal halves, matching merge sort's efficiency." },
        { case: "Average Case", bigO: "O(n log n)", meaning: "For typical, randomly ordered input, partitions are reasonably balanced across recursive calls." },
        { case: "Worst Case", bigO: "O(n²)", meaning: "If the pivot is always the smallest or largest value (as with an already-sorted array using this pivot rule), partitions become extremely unbalanced." },
        { case: "Space Complexity", bigO: "O(log n)", meaning: "Sorting happens in place, but the recursive call stack needs space proportional to the depth of recursion.", isSpace: true },
      ],
      example: {
        array: [10, 7, 8, 9, 1, 5],
        intro: "We trace one full run of quick sort on the textbook array [10, 7, 8, 9, 1, 5], always choosing the last element of each section as the pivot.",
        steps: [
          "Whole array [10, 7, 8, 9, 1, 5], pivot = 5 (last element). Only 1 is smaller than 5, so after partitioning, 5 lands at position 2 → [1, 5, 8, 9, 10, 7]. Pivot 5 is now fixed.",
          "Left of 5: just [1] — a single element is already sorted.",
          "Right of 5, positions 3–6: [8, 9, 10, 7], pivot = 7 (last element). Nothing is smaller than 7, so it swaps to the front of this section → [1, 5, 7, 9, 10, 8]. Pivot 7 is now fixed.",
          "Right of 7, positions 4–6: [9, 10, 8], pivot = 8 (last element). Nothing is smaller than 8, so it swaps to the front of this section → [1, 5, 7, 8, 10, 9]. Pivot 8 is now fixed.",
          "Right of 8, positions 5–6: [10, 9], pivot = 9 (last element). Nothing is smaller than 9, so it swaps to the front → [1, 5, 7, 8, 9, 10]. Pivot 9 is now fixed, and 10 is left alone — already sorted.",
          "Every pivot has settled into its final position. Final result: [1, 5, 7, 8, 9, 10].",
        ],
      },
    },
  };

  /* ---------------------------------------------------------
     APPLICATION STATE
     --------------------------------------------------------- */

  const state = {
    algoKey: "bubble",
    baseArray: ALGORITHMS.bubble.textbookArray.slice(),
    steps: [],
    stepIndex: 0,
    playing: false,
    timer: null,
    speed: 1750,
    minVal: 0,
    maxVal: 0,
  };

  /* ---------------------------------------------------------
     DOM REFS
     --------------------------------------------------------- */

  const els = {
    tabs: document.querySelectorAll(".algo-tab"),
    circlesRow: $("circlesRow"),
    stepCounter: $("stepCounter"),
    dialogueIndex: $("dialogueIndex"),
    dialogueText: $("dialogueText"),
    playBtn: $("playBtn"),
    stepBackBtn: $("stepBackBtn"),
    stepFwdBtn: $("stepFwdBtn"),
    resetBtn: $("resetBtn"),
    speedRange: $("speedRange"),
    speedValue: $("speedValue"),
    loadTextbookBtn: $("loadTextbookBtn"),
    customInput: $("customInput"),
    sortCustomBtn: $("sortCustomBtn"),
    inputHint: $("inputHint"),
    algoTitle: $("algoTitle"),
    algoDefinition: $("algoDefinition"),
    complexityBody: $("complexityBody"),
    textbookExample: $("textbookExample"),
    learningAlgoName: $("learningAlgoName"),
  };

  /* ---------------------------------------------------------
     RENDERING
     --------------------------------------------------------- */

  function buildStepsForCurrentArray() {
    const config = ALGORITHMS[state.algoKey];
    state.steps = config.generator(state.baseArray);
    state.stepIndex = 0;
    state.minVal = Math.min(...state.baseArray);
    state.maxVal = Math.max(...state.baseArray);
    renderCircleSkeleton();
    renderStep();
  }

  /** Create one .circle-unit element per array position (persistent DOM nodes we reposition via flex order). */
  function renderCircleSkeleton() {
    els.circlesRow.innerHTML = "";
    state.baseArray.forEach(() => {
      const unit = document.createElement("div");
      unit.className = "circle-unit";
      unit.innerHTML =
        '<div class="circle-pivot-tag"></div><div class="circle"></div><div class="circle-index"></div>';
      els.circlesRow.appendChild(unit);
    });
  }

  const MIN_DIAMETER = 42;
  const MAX_DIAMETER = 104;

  function diameterFor(value) {
    if (state.maxVal === state.minVal) return (MIN_DIAMETER + MAX_DIAMETER) / 2;
    const ratio = (value - state.minVal) / (state.maxVal - state.minVal);
    return Math.round(MIN_DIAMETER + ratio * (MAX_DIAMETER - MIN_DIAMETER));
  }

  function renderStep() {
    const step = state.steps[state.stepIndex];
    if (!step) return;

    // Step counter
    els.stepCounter.textContent = `Step ${state.stepIndex} / ${state.steps.length - 1}`;

    // Dialogue
    els.dialogueIndex.textContent = String(state.stepIndex).padStart(2, "0");
    els.dialogueText.textContent = step.message;

    // Circles — flex order reflects current array positions, so circles animate sideways as values move
    const units = els.circlesRow.children;
    step.array.forEach((value, idx) => {
      const unit = units[idx];
      if (!unit) return;
      unit.style.order = idx;

      const circle = unit.querySelector(".circle");
      const label = unit.querySelector(".circle-index");
      const pivotTag = unit.querySelector(".circle-pivot-tag");

      const d = diameterFor(value);
      circle.style.width = d + "px";
      circle.style.height = d + "px";
      circle.style.fontSize = clamp(d * 0.32, 12, 22) + "px";
      circle.textContent = value;
      label.textContent = "pos " + (idx + 1);

      circle.classList.remove("is-compare", "is-swap", "is-sorted", "is-pivot");
      unit.classList.remove("is-dimmed");
      pivotTag.textContent = "";

      if (step.sortedIndices.includes(idx)) circle.classList.add("is-sorted");
      if (step.compare.includes(idx)) circle.classList.add("is-compare");
      if (step.swap.includes(idx)) circle.classList.add("is-swap");
      if (step.pivot === idx) {
        circle.classList.add("is-pivot");
        pivotTag.textContent = "pivot";
      }
      if (step.activeRange) {
        const [lo, hi] = step.activeRange;
        if (idx < lo || idx > hi) unit.classList.add("is-dimmed");
      }
    });

    updatePlaybackButtons();
  }

  function updatePlaybackButtons() {
    const atStart = state.stepIndex <= 0;
    const atEnd = state.stepIndex >= state.steps.length - 1;
    els.stepBackBtn.disabled = atStart;
    els.stepFwdBtn.disabled = atEnd && !state.playing;
    els.playBtn.textContent = state.playing ? "⏸ Pause" : "▶ Play";
    if (atEnd) {
      stopPlaying();
      els.playBtn.textContent = "▶ Play";
    }
  }

  /* ---------------------------------------------------------
     PLAYBACK CONTROL
     --------------------------------------------------------- */

  function stepForward() {
    if (state.stepIndex < state.steps.length - 1) {
      state.stepIndex++;
      renderStep();
    }
    if (state.stepIndex >= state.steps.length - 1) stopPlaying();
  }

  function stepBackward() {
    if (state.stepIndex > 0) {
      state.stepIndex--;
      renderStep();
    }
  }

  function startPlaying() {
    if (state.stepIndex >= state.steps.length - 1) {
      state.stepIndex = 0;
      renderStep();
    }
    state.playing = true;
    els.playBtn.textContent = "⏸ Pause";
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      stepForward();
    }, state.speed);
  }

  function stopPlaying() {
    state.playing = false;
    clearInterval(state.timer);
    state.timer = null;
    els.playBtn.textContent = "▶ Play";
  }

  function togglePlay() {
    if (state.playing) stopPlaying();
    else startPlaying();
    updatePlaybackButtons();
  }

  function resetRun() {
    stopPlaying();
    state.stepIndex = 0;
    renderStep();
  }

  /* ---------------------------------------------------------
     LEARNING PANEL
     --------------------------------------------------------- */

  function renderLearningPanel() {
    const config = ALGORITHMS[state.algoKey];
    els.algoTitle.textContent = config.label;
    els.learningAlgoName.textContent = config.label.toUpperCase();
    els.algoDefinition.textContent = config.definition;

    els.complexityBody.innerHTML = "";
    config.complexities.forEach((row) => {
      const tr = document.createElement("tr");
      if (row.isSpace) tr.className = "is-space-row";
      tr.innerHTML = `
        <td>${row.case}</td>
        <td class="big-o">${row.bigO}</td>
        <td>${row.meaning}</td>
      `;
      els.complexityBody.appendChild(tr);
    });

    const ex = config.example;
    const listItems = ex.steps
      .map(
        (text, i) =>
          `<li><span class="example-step-index">${i + 1}.</span><p class="example-step-text">${text}</p></li>`
      )
      .join("");
    els.textbookExample.innerHTML = `
      <p class="example-intro">${ex.intro} Starting array: <span class="example-array">[${ex.array.join(", ")}]</span></p>
      <ol class="example-steps" style="list-style:none;padding:0;margin:0;">${listItems}</ol>
    `;
  }

  /* ---------------------------------------------------------
     DATA INPUT
     --------------------------------------------------------- */

  function loadTextbookExample() {
    stopPlaying();
    els.inputHint.classList.remove("is-error");
    els.inputHint.textContent = "Use 2–12 whole numbers between 1 and 99, separated by commas.";
    els.customInput.value = "";
    state.baseArray = ALGORITHMS[state.algoKey].textbookArray.slice();
    buildStepsForCurrentArray();
  }

  function parseCustomInput(raw) {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parts.length < 2 || parts.length > 12) {
      return { error: "Please enter between 2 and 12 numbers, separated by commas." };
    }
    const nums = [];
    for (const p of parts) {
      if (!/^\d+$/.test(p)) {
        return { error: `"${p}" is not a whole number. Please use whole numbers only.` };
      }
      const n = parseInt(p, 10);
      if (n < 1 || n > 99) {
        return { error: `${n} is out of range. Please use whole numbers between 1 and 99.` };
      }
      nums.push(n);
    }
    return { values: nums };
  }

  function sortCustomInput() {
    const result = parseCustomInput(els.customInput.value);
    if (result.error) {
      els.inputHint.textContent = result.error;
      els.inputHint.classList.add("is-error");
      return;
    }
    stopPlaying();
    els.inputHint.classList.remove("is-error");
    els.inputHint.textContent = "Use 2–12 whole numbers between 1 and 99, separated by commas.";
    state.baseArray = result.values;
    buildStepsForCurrentArray();
  }

  /* ---------------------------------------------------------
     ALGORITHM SWITCHING
     --------------------------------------------------------- */

  function selectAlgorithm(key) {
    if (!ALGORITHMS[key]) return;
    stopPlaying();
    state.algoKey = key;

    els.tabs.forEach((tab) => {
      const isActive = tab.dataset.algo === key;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    renderLearningPanel();
    // Keep a custom array if the user typed one; otherwise load this algorithm's textbook example
    if (!els.customInput.value.trim()) {
      state.baseArray = ALGORITHMS[key].textbookArray.slice();
    }
    buildStepsForCurrentArray();
  }

  /* ---------------------------------------------------------
     EVENT WIRING
     --------------------------------------------------------- */

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectAlgorithm(tab.dataset.algo));
  });

  els.playBtn.addEventListener("click", togglePlay);
  els.stepFwdBtn.addEventListener("click", () => {
    stopPlaying();
    stepForward();
  });
  els.stepBackBtn.addEventListener("click", () => {
    stopPlaying();
    stepBackward();
  });
  els.resetBtn.addEventListener("click", resetRun);

  els.speedRange.addEventListener("input", () => {
    state.speed = parseInt(els.speedRange.value, 10);
    els.speedValue.textContent = (state.speed / 1000).toFixed(2) + "s / step";
    if (state.playing) startPlaying(); // restart interval at new speed
  });

  els.loadTextbookBtn.addEventListener("click", loadTextbookExample);
  els.sortCustomBtn.addEventListener("click", sortCustomInput);
  els.customInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sortCustomInput();
  });

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */

  function init() {
    els.speedValue.textContent = (state.speed / 1000).toFixed(2) + "s / step";
    renderLearningPanel();
    buildStepsForCurrentArray();
  }

  init();
})();
