class Htmlify
  def run(string)
    localizationUsed = false
    string = string.gsub(/\[(lang-(.*))\](.*)\[\/\1\]/m){
      localizationUsed = true
      content = htmlify($3)
      tag = $1
      content = "[#{tag}]#{content}[/#{tag}]"
    }
    if(!localizationUsed)
      string = htmlify(string)
    end
    return string
  end
  
  def htmlify(string)
    string = "<p>#{string}</p>"
    string = headings(string)
    string = string.gsub("\n","<br>")
    string = string.gsub("[real-line-break]","\n")
    string = clean(string)
  end
  
  def clean(string)
    string = string.sub("<p><br><br></p>","")
    string
  end
  
  def headings(string)
    string = string.gsub(/^([^\n]+)\n\={1,}\n{0,}/) do ||
      "</p><h1>#{$1}</h1><p>"
    end
    string = string.gsub(/^([^\n]+)\n\-{1,}\n{0,}/) do ||
      "</p><h2>#{$1}</h2><p>"
    end
    
    return string
  end
  
  
  
end
