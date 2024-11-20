class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEndOfWord: boolean = false;
}

export class Dictionary {
  private static instance: Dictionary;
  private root: TrieNode = new TrieNode();
  private initialized: boolean = false;

  // Singleton pattern to ensure we only have one dictionary instance
  public static getInstance(): Dictionary {
    if (!Dictionary.instance) {
      Dictionary.instance = new Dictionary();
    }
    return Dictionary.instance;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      const response = await fetch(
        'https://poetaoqjughfnvkkgkru.supabase.co/storage/v1/object/public/dictionary/dictionary-en.txt?t=2024-11-14T18%3A18%3A29.817Z',
        {
          cache: 'force-cache',
          next: { revalidate: 86400 } // Cache for 24 hours
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch dictionary: ${response.statusText}`);
      }

      const data = await response.text();
      const words = data.split('\n');

      words.forEach(word => this.addWord(word.trim().toUpperCase()));
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load dictionary:', error);
    }
  }

  private addWord(word: string) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  isValidWord(word: string): boolean {
    let node = this.root;
    for (const char of word.toUpperCase()) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }
}
