// lib/constants.ts

import { SupportedLanguage } from "./types";

export const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  javascript: `// Find duplicates in array (JavaScript)
function findDuplicates(arr) {
  const dup = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        dup.push(arr[i]);
      }
    }
  }
  return dup;
}

console.log(findDuplicates([1, 2, 3, 2, 4, 3]));`,

  python: `# Find duplicates in array (Python)
def find_duplicates(arr):
    dup = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                dup.append(arr[i])
    return dup

print(find_duplicates([1, 2, 3, 2, 4, 3]))`,

  cpp: `// Find duplicates in array (C++)
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> nums = {1,2,3,2,4,3};
    vector<int> dup;
    for (int i = 0; i < nums.size(); ++i) {
        for (int j = i + 1; j < nums.size(); ++j) {
            if (nums[i] == nums[j]) {
                dup.push_back(nums[i]);
            }
        }
    }
    for (int x : dup) cout << x << " ";
    return 0;
}`,

  java: `// Find duplicates in array (Java)
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 2, 4, 3};
        List<Integer> dup = new ArrayList<>();
        
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] == nums[j]) {
                    dup.add(nums[i]);
                }
            }
        }
        
        System.out.println(dup);
    }
}`,
};

export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  label: string;
  monacoLang: string;
  pistonLang: string;
  pistonVersion: string;
  extension: string;
}> = {
  javascript: {
    label: "JavaScript",
    monacoLang: "javascript",
    pistonLang: "javascript",
    pistonVersion: "18.15.0",
    extension: ".js",
  },
  python: {
    label: "Python",
    monacoLang: "python",
    pistonLang: "python",
    pistonVersion: "3.10.0",
    extension: ".py",
  },
  cpp: {
    label: "C++",
    monacoLang: "cpp",
    pistonLang: "c++",
    pistonVersion: "10.2.0",
    extension: ".cpp",
  },
  java: {
    label: "Java",
    monacoLang: "java",
    pistonLang: "java",
    pistonVersion: "15.0.2",
    extension: ".java",
  },
};

export const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";