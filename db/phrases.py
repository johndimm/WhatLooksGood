import sys
import nltk
import util
from nltk.corpus import stopwords

NLINES = 1000000 

# Used when tokenizing words
sentence_re = r'''(?x)      # set flag to allow verbose regexps
      ([A-Z])(\.[A-Z])+\.?  # abbreviations, e.g. U.S.A.
    | \w+(-\w+)*            # words with optional internal hyphens
    | \$?\d+(\.\d+)?%?      # currency and percentages, e.g. $12.40, 82%
    | \.\.\.                # ellipsis
    | [][.,;"'?():-_`]      # these are separate tokens
'''

sentence_re = r'(?:(?:[A-Z])(?:.[A-Z])+.?)|(?:\w+(?:-\w+)*)|(?:\$?\d+(?:.\d+)?%?)|(?:...|)(?:[][.,;"\'?():-_`])'

lemmatizer = nltk.WordNetLemmatizer()
stemmer = nltk.stem.porter.PorterStemmer()
grammar = r"""
    NBAR:
        {<NN.*|JJ|RB>*<NN.*>}  # Nouns and Adjectives, terminated with Nouns
        
    NP:
        {<NBAR>}
        {<NBAR><IN><NBAR>}  # Above, connected with in/of/etc...
"""
chunker = nltk.RegexpParser(grammar)
stopwords = stopwords.words('english')

def parseLine(id, business_id, text):
#  print (text)
  toks = nltk.regexp_tokenize(text, sentence_re)
  postoks = nltk.tag.pos_tag(toks)
#  print (postoks)
  tree = chunker.parse(postoks)
  terms = get_terms(tree)

  for term in terms:
    sys.stdout.write ("%s\t%s\t" % (id, business_id))
    for word in term:
        sys.stdout.write (word + " ")
    print ("")

def leaves(tree):
    """Finds NP (nounphrase) leaf nodes of a chunk tree."""
    for subtree in tree.subtrees(filter = lambda t: t.label()=='NP'):
        yield subtree.leaves()

def normalise(word):
    """Normalises words to lowercase and stems and lemmatizes it."""
    word = word.lower()
    # word = stemmer.stem_word(word) #if we consider stemmer then results comes with stemmed word, but in this case word will not match with comment
#    word = lemmatizer.lemmatize(word)
    return word

def acceptable_word(word):
    """Checks conditions for acceptable word: length, stopword. We can increase the length if we want to consider large phrase"""
    accepted = bool(2 <= len(word) <= 40
        and word.lower() not in stopwords)
    return accepted

def get_terms(tree):
    for leaf in leaves(tree):
        term = [ normalise(w) for w,t in leaf if acceptable_word(w) ]
        yield term

def scan():
  filename = sys.argv[1]
  print (filename)
  caption_file = open(filename)
  i = 0
  for line in caption_file:
    (id, business_id, caption) = util.get_fields(line)
    i += 1
    if caption == '':
       continue
    if i > NLINES:
       break
    #caption = "the brown cow ran over the pathetic farmer's lovely wife"

    parseLine(id, business_id, caption)

scan()
