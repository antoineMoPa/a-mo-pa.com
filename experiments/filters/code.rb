class Code
  def run(string)
    codetypes = ["terminal","code","pre"]
    codetypes.each do |type|
      string = string
        .gsub(
              /\[#{type}\]\n?(.+?)\[\/#{type}\]/m) {
        content = $1.gsub("\n","[real-line-break]")
        "</p><pre class='#{type}'>#{content}</pre><p>"
      }
    end
    return string
  end
end
